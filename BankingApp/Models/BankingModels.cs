using System;
using System.ComponentModel.DataAnnotations;

namespace BankingApp.Models
{
    // Bảng người dùng
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required, StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required, StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;
        
        public int Balance { get; set; } = 100000; // Số dư mặc định 100k
    }

    // Bảng lịch sử chuyển tiền
    public class Transfer
    {
        [Key]
        public int Id { get; set; }
        public int FromUserId { get; set; }
        public int ToUserId { get; set; }
        public int Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // Bảng thông báo
    public class Notification
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        [StringLength(255)]
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}