using Microsoft.AspNetCore.Mvc;
using BankingApp.Data;
using System.Linq;

namespace BankingApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountController(AppDbContext context)
        {
            _context = context;
        }

        // --- Hàm hỗ trợ: Lấy User ID từ Session Header ---
        private int? GetUserIdFromSession()
        {
            // Lấy header "x-session" từ request
            if (!Request.Headers.TryGetValue("x-session", out var sessionValues))
            {
                return null;
            }

            var sessionId = sessionValues.FirstOrDefault();
            
            if (string.IsNullOrEmpty(sessionId) || !AuthController.Sessions.TryGetValue(sessionId, out int userId))
            {
                return null;
            }

            return userId;
        }

        // --- API 3: LẤY THÔNG TIN NGƯỜI DÙNG (/api/me) ---
        [HttpGet("me")]
        public IActionResult GetMe()
        {
            var userId = GetUserIdFromSession();
            if (userId == null)
                return Unauthorized(new { message = "Missing or invalid session" });

            var user = _context.Users.Find(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new { id = user.Id, username = user.Username, balance = user.Balance });
        }

        // --- API 4: LẤY SỐ DƯ (/api/balance) ---
        [HttpGet("balance")]
        public IActionResult GetBalance()
        {
            var userId = GetUserIdFromSession();
            if (userId == null)
                return Unauthorized(new { message = "Missing or invalid session" });

            var user = _context.Users.Find(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new { balance = user.Balance });
        }
    }
}