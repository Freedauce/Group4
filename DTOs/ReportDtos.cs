namespace FinalExam3.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalCars { get; set; }
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingApprovals { get; set; }
        public int ActiveBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CarOwners { get; set; }
    }

    public class BookingsByMonthDto
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

    public class CarsByTypeDto
    {
        public string CarType { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class RevenueReportDto
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    public class OwnerStatsDto
    {
        public int TotalCars { get; set; }
        public int ApprovedCars { get; set; }
        public int PendingCars { get; set; }
        public int TotalBookings { get; set; }
        public int ActiveBookings { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal PendingPayments { get; set; }
    }

    public class ClientStatsDto
    {
        public int TotalBookings { get; set; }
        public int ActiveBookings { get; set; }
        public int CompletedBookings { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal ConfirmedPaid { get; set; }
    }
}
