using Microsoft.AspNetCore.Mvc;
using BankingApp.Data;
using BankingApp.Models;
using System.Linq;

namespace BankingApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class TransferController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransferController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetUserIdFromSession()
        {
            if (!Request.Headers.TryGetValue("x-session", out var sessionValues))
                return null;

            var sessionId = sessionValues.FirstOrDefault();
            if (string.IsNullOrEmpty(sessionId) || !AuthController.Sessions.TryGetValue(sessionId, out int userId))
                return null;

            return userId;
        }

        public class TransferReq
        {
            public string ToUsername { get; set; } = string.Empty;
            public int Amount { get; set; }
        }

        // --- API 5: CHUYỂN TIỀN (/api/transfer) ---
        [HttpPost("transfer")]
        public IActionResult Transfer([FromBody] TransferReq body)
        {
            var senderId = GetUserIdFromSession();
            if (senderId == null)
                return Unauthorized(new { message = "Missing or invalid session" });

            if (body.Amount <= 0)
                return BadRequest(new { message = "Amount must be > 0" });

            // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
            using var transaction = _context.Database.BeginTransaction();
            try
            {
                var sender = _context.Users.Find(senderId);
                if (sender == null) return NotFound(new { message = "Sender not found" });

                var receiver = _context.Users.FirstOrDefault(u => u.Username == body.ToUsername);
                if (receiver == null) return NotFound(new { message = "Receiver not found" });

                if (sender.Id == receiver.Id)
                    return BadRequest(new { message = "Cannot transfer to yourself" });

                if (sender.Balance < body.Amount)
                    return BadRequest(new { message = "Insufficient balance" });

                // 1. Cập nhật số dư
                sender.Balance -= body.Amount;
                receiver.Balance += body.Amount;

                // 2. Ghi lịch sử giao dịch
                var transferLog = new Transfer
                {
                    FromUserId = sender.Id,
                    ToUserId = receiver.Id,
                    Amount = body.Amount
                };
                _context.Transfers.Add(transferLog);

                // 3. Tạo thông báo
                var msgSender = $"Bạn đã chuyển {body.Amount} đến {receiver.Username}";
                var msgReceiver = $"Bạn nhận {body.Amount} từ {sender.Username}";

                _context.Notifications.Add(new Notification { UserId = sender.Id, Message = msgSender });
                _context.Notifications.Add(new Notification { UserId = receiver.Id, Message = msgReceiver });

                _context.SaveChanges();
                transaction.Commit(); // Hoàn tất Transaction

                return Ok(new { ok = true, from = sender.Username, to = receiver.Username, amount = body.Amount });
            }
            catch (System.Exception)
            {
                transaction.Rollback(); // Nếu có lỗi, hoàn tác mọi thay đổi
                return StatusCode(500, new { message = "Internal server error during transfer" });
            }
        }
    }
}