namespace FinalExam3.Models
{
    public class LoginVerificationToken
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Code { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Navigation
        public User User { get; set; } = null!;
    }
}
