using Microsoft.AspNetCore.Mvc;
using BankingApp.Data;
using BankingApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BankingApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Tạm thời sử dụng Dictionary lưu trong RAM để quản lý Session thay cho Redis để dễ triển khai
        public static Dictionary<string, int> Sessions = new Dictionary<string, int>();

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // --- Lớp chứa dữ liệu nhận từ Client ---
        public class RegisterReq
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class LoginReq
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // --- API 1: ĐĂNG KÝ TÀI KHOẢN (/api/register) ---
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterReq body)
        {
            // Kiểm tra độ dài hợp lệ
            if (body.Username.Length < 3 || body.Password.Length < 6)
                return BadRequest(new { message = "Username >= 3, password >= 6" });

            // Kiểm tra user đã tồn tại chưa
            var exists = _context.Users.Any(u => u.Username == body.Username);
            if (exists)
                return Conflict(new { message = "Username already exists" });

            // Tạo user mới và mã hóa mật khẩu
            var user = new User
            {
                Username = body.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(body.Password)
            };

            _context.Users.Add(user);
            _context.SaveChanges(); // Lưu xuống MySQL

            return Ok(new { id = user.Id, username = user.Username, balance = user.Balance });
        }

        // --- API 2: ĐĂNG NHẬP (/api/login) ---
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginReq body)
        {
            // Tìm user trong MySQL
            var user = _context.Users.FirstOrDefault(u => u.Username == body.Username);
            
            // Xác thực mật khẩu
            if (user == null || !BCrypt.Net.BCrypt.Verify(body.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials" });

            // Tạo Session ID ngẫu nhiên (Mã hex 32 ký tự)
            var sessionId = Guid.NewGuid().ToString("N");
            Sessions[sessionId] = user.Id;

            return Ok(new { session = sessionId, username = user.Username, balance = user.Balance });
        }
    }
}