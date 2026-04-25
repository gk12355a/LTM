using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;

namespace HttpServerCore
{
    class Program
    {
        private const int MaxConnections = 6400; // [Yêu cầu BTL]: 6400 kết nối
        private const int Port = 8080;
        private static readonly HttpClient _httpClient = new HttpClient(); 
        private const string BackendUrl = "http://localhost:5156"; 
        
        // --- CÁC BIẾN THỐNG KÊ (STATISTICS) ---
        private static int _totalRequests = 0;
        private static int _activeConnections = 0;
        private static readonly string LogFilePath = "server_log.txt";

        static async Task Main(string[] args)
        {
            using Socket serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            try
            {
                serverSocket.Bind(new IPEndPoint(IPAddress.Any, Port));
                serverSocket.Listen(MaxConnections); 

                Console.WriteLine("=========================================");
                Console.WriteLine($"[HTTP SERVER CORE] Đang chạy thành công!");
                Console.WriteLine($"[Lắng nghe tại]  : http://localhost:{Port}");
                Console.WriteLine($"[File Nhật ký]   : {LogFilePath}");
                Console.WriteLine("=========================================\n");

                while (true)
                {
                    Socket clientSocket = await serverSocket.AcceptAsync();
                    _ = Task.Run(() => HandleClientAsync(clientSocket));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LỖI SERVER]: {ex.Message}");
            }
        }

        static async Task HandleClientAsync(Socket client)
        {
            // Tăng số lượng kết nối đang hoạt động
            Interlocked.Increment(ref _activeConnections);

            try
            {
                // [Yêu cầu BTL]: Xử lý Timeout
                client.ReceiveTimeout = 5000; 
                string clientIp = ((IPEndPoint)client.RemoteEndPoint!).Address.ToString();

                byte[] buffer = new byte[8192];
                int bytesRead = await client.ReceiveAsync(buffer, SocketFlags.None);

                if (bytesRead > 0)
                {
                    Interlocked.Increment(ref _totalRequests); // Tăng tổng số Request

                    string requestText = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    string[] requestLines = requestText.Split(new[] { "\r\n" }, StringSplitOptions.None);
                    if (requestLines.Length == 0 || string.IsNullOrWhiteSpace(requestLines[0])) return;

                    string[] requestLineParts = requestLines[0].Split(' ');
                    string method = requestLineParts[0]; 
                    string url = requestLineParts.Length > 1 ? requestLineParts[1] : "/";

                    if (url.Contains("favicon.ico")) return;

                    // 1. [Yêu cầu BTL]: Ghi nhật ký (Logging) ra file
                    string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] IP: {clientIp} | Lệnh: {method} | URL: {url}\n";
                    Console.Write(logEntry);
                    await File.AppendAllTextAsync(LogFilePath, logEntry);

                    // 2. [Yêu cầu BTL]: Xử lý Thống kê trực tiếp tại Socket Server
                    if (url == "/stats")
                    {
                        string htmlStats = $"<html><body style='font-family: Arial; padding: 20px;'>" +
                                           $"<h1>Thống kê Máy chủ HTTP Socket</h1>" +
                                           $"<ul>" +
                                           $"<li>Tổng số Request đã xử lý: <b>{_totalRequests}</b></li>" +
                                           $"<li>Kết nối đang hoạt động: <b>{_activeConnections}</b></li>" +
                                           $"<li>Giới hạn cấu hình: <b>{MaxConnections}</b> kết nối</li>" +
                                           $"</ul></body></html>";
                        
                        string statsResponse = "HTTP/1.1 200 OK\r\n" +
                                               "Content-Type: text/html; charset=UTF-8\r\n" +
                                               $"Content-Length: {Encoding.UTF8.GetByteCount(htmlStats)}\r\n" +
                                               "Connection: close\r\n\r\n" + htmlStats;
                                               
                        await client.SendAsync(Encoding.UTF8.GetBytes(statsResponse), SocketFlags.None);
                        return; // Xử lý xong, không cần gọi sang C# API nữa
                    }

                    // 3. Xử lý các request khác (Chuyển tiếp sang BankingApp)
                    int bodyIndex = requestText.IndexOf("\r\n\r\n");
                    string bodyText = bodyIndex >= 0 ? requestText.Substring(bodyIndex + 4) : "";

                    var targetUrl = BackendUrl + url;
                    var backendRequest = new HttpRequestMessage(new HttpMethod(method), targetUrl);

                    if (method == "POST" || method == "PUT")
                        backendRequest.Content = new StringContent(bodyText, Encoding.UTF8, "application/json");

                    // 1. Thử đọc Session từ Header do Swagger gửi (x-session)
                    string sessionValue = ExtractHeader(requestText, "x-session");
                    
                    // 2. Nếu Swagger không gửi, thử tìm trong Cookie do Trình duyệt gửi
                    if (string.IsNullOrEmpty(sessionValue))
                    {
                        sessionValue = ExtractCookie(requestText, "session");
                    }

                    // 3. Nếu tìm thấy Session (từ Header hoặc Cookie), gắn nó vào gói tin gửi sang Backend
                    if (!string.IsNullOrEmpty(sessionValue))
                    {
                        backendRequest.Headers.Add("x-session", sessionValue);
                    }

                    var backendResponse = await _httpClient.SendAsync(backendRequest);
                    var responseBody = await backendResponse.Content.ReadAsByteArrayAsync();

                    string contentType = backendResponse.Content.Headers.ContentType?.ToString() ?? "application/json";
                    int statusCode = (int)backendResponse.StatusCode;

                    string headers = $"HTTP/1.1 {statusCode} {backendResponse.ReasonPhrase}\r\n" +
                                     $"Content-Type: {contentType}; charset=UTF-8\r\n" +
                                     $"Content-Length: {responseBody.Length}\r\n" +
                                     "Connection: close\r\n\r\n";

                    await client.SendAsync(Encoding.UTF8.GetBytes(headers), SocketFlags.None);
                    await client.SendAsync(responseBody, SocketFlags.None);
                }
            }
            catch (Exception)
            {
                // Bỏ qua lỗi kết nối (Timeout, ngắt mạng) để Server không bị sập
            }
            finally
            {
                // Luôn nhớ giảm số active connection và đóng kết nối
                Interlocked.Decrement(ref _activeConnections);
                client.Close(); 
            }
        }

        static string ExtractCookie(string requestText, string cookieName)
        {
            string[] lines = requestText.Split(new[] { "\r\n" }, StringSplitOptions.None);
            foreach (var line in lines)
            {
                if (line.StartsWith("Cookie:", StringComparison.OrdinalIgnoreCase))
                {
                    string cookieStr = line.Substring(7).Trim();
                    string[] cookies = cookieStr.Split(';');
                    foreach (var c in cookies)
                    {
                        var parts = c.Trim().Split('=');
                        if (parts.Length == 2 && parts[0] == cookieName) return parts[1];
                    }
                }
            }
            return "";
        }
        static string ExtractHeader(string requestText, string headerName)
        {
            string[] lines = requestText.Split(new[] { "\r\n" }, StringSplitOptions.None);
            string prefix = headerName + ":";
            foreach (var line in lines)
            {
                if (line.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                {
                    return line.Substring(prefix.Length).Trim();
                }
            }
            return "";
        }
    }
}