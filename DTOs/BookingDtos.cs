using FinalExam3.Models.Enums;

namespace FinalExam3.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string? UserPhone { get; set; }
        public int CarId { get; set; }
        public string CarName { get; set; } = string.Empty;
        public string CarImage { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? PickupLocation { get; set; }
        public string? DropoffLocation { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public PaymentDto? Payment { get; set; }
    }

    public class CreateBookingDto
    {
        public int CarId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? PickupLocation { get; set; }
        public string? DropoffLocation { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateBookingStatusDto
    {
        public BookingStatus Status { get; set; }
    }
}
