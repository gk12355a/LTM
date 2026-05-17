Dưới đây là nội dung **README.md** hoàn chỉnh, được viết bằng tiếng Việt, rõ ràng, chuyên nghiệp và có định dạng Markdown đẹp:

```markdown
# HƯỚNG DẪN VẬN HÀNH HỆ THỐNG HTTP SERVER & BANKING APP

Dự án này bao gồm **ba thành phần chính**:

- **HttpServerCore**: Chương trình xử lý giao thức **HTTP/1.1** bằng Socket thuần, đóng vai trò làm **Proxy Server**, ghi log và quản lý kết nối.
- **BankingApp**: Ứng dụng xử lý nghiệp vụ Ngân hàng (Backend API) được xây dựng bằng **C# .NET 8** và cơ sở dữ liệu **MySQL**.
- **banking-frontend**: Giao diện người dùng được xây dựng bằng **React + Vite + TailwindCSS**.

---

## I. Yêu cầu hệ thống

- **.NET SDK**: Phiên bản **8.0** trở lên
- **Node.js**: Phiên bản **18.0** trở lên (kèm npm)
- **MySQL Server**: Đã khởi chạy tại địa chỉ `192.168.23.60`
- **Database**: Đã tạo database tên `bankingdb`

---

## II. Các bước chuẩn bị

### 1. Cấu hình chuỗi kết nối cơ sở dữ liệu

Mở file **`BankingApp/Program.cs`** và đảm bảo chuỗi kết nối (`ConnectionString`) như sau:

```csharp
Server=192.168.23.60;Database=bankingdb;User Id=laptrinhmang;Password=laptrinhmang;
```

### 2. Khởi tạo Database (Chỉ thực hiện lần đầu tiên)

Mở **Terminal** tại thư mục `BankingApp` và chạy lần lượt các lệnh sau:

```bash
# Khôi phục các thư viện NuGet
dotnet restore

# Tạo migration và cập nhật database
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## III. Hướng dẫn khởi chạy hệ thống

Để hệ thống hoạt động hoàn chỉnh, cần mở **3 cửa sổ Terminal** riêng biệt.

### Bước 1: Chạy Backend API (BankingApp)

```bash
cd BankingApp
dotnet run
```

→ Ứng dụng sẽ lắng nghe tại: **http://localhost:5156**

### Bước 2: Chạy HTTP Server Core (Proxy Socket Server)

```bash
cd HttpServerCore
dotnet run
```

→ Server sẽ lắng nghe kết nối tại: **http://localhost:8080**

### Bước 3: Cài đặt và chạy Frontend (lần đầu tiên)

```bash
cd banking-frontend
npm install
npm run dev
```

→ Giao diện người dùng sẽ chạy tại: **http://localhost:5173**

> **Lưu ý**: Từ lần thứ hai trở đi, chỉ cần chạy `npm run dev` (bỏ qua `npm install`).

---

## IV. Kiểm tra và Trải nghiệm

Sau khi cả ba chương trình đã chạy thành công, bạn có thể truy cập qua trình duyệt:

### 1. Giao diện người dùng (Frontend)

- **URL**: [http://localhost:5173](http://localhost:5173)

| Trang | Đường dẫn | Mô tả |
|---|---|---|
| Đăng nhập | `/login` | Đăng nhập bằng tài khoản đã có |
| Đăng ký | `/register` | Tạo tài khoản mới, nhận ngay **100.000 ₫** |
| Tổng quan | `/dashboard` | Xem số dư, thống kê giao dịch, hoạt động gần đây |
| Chuyển tiền | `/transfer` | Chuyển tiền real-time đến tài khoản khác |
| Thông báo | `/notifications` | Xem lịch sử giao dịch gửi/nhận |

**Luồng kiến trúc**:
```
Browser (:5173) → Vite Proxy → HttpServerCore (:8080) → BankingApp (:5156) → MySQL
                                      ↑ Ghi log tại đây
```

### 2. Giao diện quản lý API (Swagger)

- **URL**: [http://localhost:8080/swagger](http://localhost:8080/swagger)

> Tất cả các yêu cầu API đều phải đi qua **HttpServerCore** (cổng 8080) trước khi được chuyển tiếp đến Backend.

### 3. Trang Thống kê hệ thống

- **URL**: [http://localhost:8080/stats](http://localhost:8080/stats)

Trang này hiển thị số lượng request và kết nối đang hoạt động (được xử lý trực tiếp bởi Socket Server).

### 4. Nhật ký hoạt động (Logging)

- Toàn bộ log mạng được in trực tiếp trên **Console** của `HttpServerCore`.
- Log chi tiết được tự động ghi vào file: **`HttpServerCore/server_log.txt`**

---

## V. Các tính năng cốt lõi đã triển khai

### Backend & Infrastructure
- **Giao thức**: HTTP/1.1 (hỗ trợ GET, POST)
- **Quản lý phiên**: Xử lý Cookie và Session ID thông qua Header `x-session`
- **Hiệu năng**: Xử lý đa luồng (`Task-based`), hỗ trợ tối đa **6400 kết nối đồng thời**
- **Bảo mật**:
  - Timeout kết nối: 5 giây
  - Mã hóa mật khẩu bằng **BCrypt**
- **Nghiệp vụ ngân hàng**:
  - Đăng ký tài khoản (số dư khởi đầu 100.000 ₫)
  - Đăng nhập với session management
  - Chuyển tiền thời gian thực (Realtime) với DB Transaction
  - Xem lịch sử giao dịch và thông báo

### Frontend (React + Vite + TailwindCSS)
- **Giao diện**: Dark mode, glassmorphism, responsive (desktop & mobile)
- **Đăng ký / Đăng nhập**: Form có kiểm tra độ mạnh mật khẩu, thông báo lỗi rõ ràng
- **Dashboard**: Hiển thị số dư, thống kê giao dịch, tự động làm mới mỗi 30 giây
- **Chuyển tiền**: Nhập nhanh với các mức tiền có sẵn, cập nhật số dư ngay sau giao dịch
- **Thông báo**: Lọc theo loại (gửi/nhận), tự động làm mới mỗi 15 giây
- **Bảo mật**: Session lưu trong `localStorage`, tự động chuyển hướng nếu chưa đăng nhập

---
