using Microsoft.AspNetCore.Mvc;
using BankingApp.Data;
using System.Linq;

namespace BankingApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        // Hàm hỗ trợ lấy UserId từ Header x-session
        private int? GetUserIdFromSession()
        {
            if (!Request.Headers.TryGetValue("x-session", out var sessionValues))
                return null;

            var sessionId = sessionValues.FirstOrDefault();
            if (string.IsNullOrEmpty(sessionId) || !AuthController.Sessions.TryGetValue(sessionId, out int userId))
                return null;

            return userId;
        }

        // --- API 6: LẤY DANH SÁCH THÔNG BÁO (/api/notifications) ---
        [HttpGet("notifications")]
        public IActionResult GetNotifications()
        {
            var userId = GetUserIdFromSession();
            if (userId == null)
                return Unauthorized(new { message = "Missing or invalid session" });

            // Lấy 50 thông báo mới nhất của user này, sắp xếp theo thời gian giảm dần
            var notifications = _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .Select(n => new
                {
                    id = n.Id,
                    message = n.Message,
                    is_read = n.IsRead,
                    created_at = n.CreatedAt
                })
                .ToList();

            return Ok(notifications);
        }
    }
}