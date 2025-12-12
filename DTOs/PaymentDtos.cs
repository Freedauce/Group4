using FinalExam3.Models.Enums;

namespace FinalExam3.DTOs
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public int PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionReference { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        
        // Commission fields (5% platform fee)
        public decimal PlatformFee { get; set; } // 5% of Amount
        public decimal OwnerPayout { get; set; } // 95% of Amount
        
        // Car and booking info
        public string? CarName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        
        // Customer info (for owner view)
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        
        // Owner info (for client view after payment confirmed)
        public string? OwnerName { get; set; }
        public string? OwnerPhone { get; set; }
        public string? OwnerEmail { get; set; }
    }

    public class UpdatePaymentStatusDto
    {
        public PaymentStatus Status { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
    }
}
