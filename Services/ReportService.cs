using FinalExam3.Data;
using FinalExam3.DTOs;
using FinalExam3.Models.Enums;
using FinalExam3.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalExam3.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            // Simple counts that always work
            var totalUsers = await _context.Users.CountAsync();
            var totalCars = await _context.Cars.CountAsync();
            var totalBookings = await _context.Bookings.CountAsync();
            
            // Safe sum - get all paid payments then sum in memory
            var paidPayments = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Paid)
                .ToListAsync();
            var totalRevenue = paidPayments.Sum(p => p.Amount);

            var pendingApprovals = await _context.Users
                .CountAsync(u => u.ApprovalStatus == ApprovalStatus.Pending);

            var activeBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.InProgress);
            
            var completedBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Completed);
            
            var carOwners = await _context.Users
                .CountAsync(u => u.Role == UserRole.CarOwner);

            return new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalCars = totalCars,
                TotalBookings = totalBookings,
                TotalRevenue = totalRevenue,
                PendingApprovals = pendingApprovals,
                ActiveBookings = activeBookings,
                CompletedBookings = completedBookings,
                CarOwners = carOwners
            };
        }

        public async Task<List<BookingsByMonthDto>> GetBookingsByMonthAsync(int year)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Payment)
                .Where(b => b.CreatedAt.Year == year)
                .ToListAsync();

            var monthlyData = bookings
                .GroupBy(b => b.CreatedAt.Month)
                .Select(g => new BookingsByMonthDto
                {
                    Month = new DateTime(year, g.Key, 1).ToString("MMM"),
                    Count = g.Count(),
                    Revenue = g.Sum(b => b.Payment != null && b.Payment.Status == PaymentStatus.Paid ? b.Payment.Amount : 0)
                })
                .ToList();

            // Fill in missing months
            var allMonths = new List<BookingsByMonthDto>();
            for (int i = 1; i <= 12; i++)
            {
                var existing = monthlyData.FirstOrDefault(m => m.Month == new DateTime(year, i, 1).ToString("MMM"));
                if (existing != null)
                {
                    allMonths.Add(existing);
                }
                else
                {
                    allMonths.Add(new BookingsByMonthDto
                    {
                        Month = new DateTime(year, i, 1).ToString("MMM"),
                        Count = 0,
                        Revenue = 0
                    });
                }
            }

            return allMonths;
        }

        public async Task<List<CarsByTypeDto>> GetCarsByTypeAsync()
        {
            var cars = await _context.Cars.ToListAsync();

            return cars
                .GroupBy(c => c.CarType)
                .Select(g => new CarsByTypeDto
                {
                    CarType = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToList();
        }

        public async Task<List<RevenueReportDto>> GetRevenueReportAsync(DateTime startDate, DateTime endDate)
        {
            var payments = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Paid &&
                           p.PaidAt.HasValue &&
                           p.PaidAt.Value >= startDate &&
                           p.PaidAt.Value <= endDate)
                .OrderBy(p => p.PaidAt)
                .ToListAsync();

            return payments
                .GroupBy(p => p.PaidAt!.Value.Date)
                .Select(g => new RevenueReportDto
                {
                    Date = g.Key,
                    Amount = g.Sum(p => p.Amount)
                })
                .ToList();
        }

        public async Task<OwnerStatsDto> GetOwnerStatsAsync(int ownerId)
        {
            var cars = await _context.Cars
                .Where(c => c.OwnerId == ownerId)
                .ToListAsync();

            var carIds = cars.Select(c => c.Id).ToList();

            var bookings = await _context.Bookings
                .Include(b => b.Payment)
                .Where(b => carIds.Contains(b.CarId))
                .ToListAsync();

            var totalEarnings = bookings
                .Where(b => b.Payment != null && b.Payment.Status == PaymentStatus.Paid)
                .Sum(b => b.Payment!.Amount);

            var pendingPayments = bookings
                .Where(b => b.Payment != null && b.Payment.Status == PaymentStatus.Pending)
                .Sum(b => b.Payment!.Amount);

            return new OwnerStatsDto
            {
                TotalCars = cars.Count,
                ApprovedCars = cars.Count(c => c.Status == CarStatus.Available),
                PendingCars = cars.Count(c => c.Status == CarStatus.PendingApproval),
                TotalBookings = bookings.Count,
                ActiveBookings = bookings.Count(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.InProgress),
                TotalEarnings = totalEarnings,
                PendingPayments = pendingPayments
            };
        }

        public async Task<ClientStatsDto> GetClientStatsAsync(int clientId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Payment)
                .Where(b => b.UserId == clientId)
                .ToListAsync();

            // Total spent = sum of all non-cancelled booking prices
            var totalSpent = bookings
                .Where(b => b.Status != BookingStatus.Cancelled)
                .Sum(b => b.TotalPrice);

            // Confirmed paid = sum of actually paid payment amounts
            var confirmedPaid = bookings
                .Where(b => b.Payment != null && b.Payment.Status == PaymentStatus.Paid)
                .Sum(b => b.Payment!.Amount);

            // Pending amount = sum of pending payment amounts
            var pendingAmount = bookings
                .Where(b => b.Payment != null && b.Payment.Status == PaymentStatus.Pending)
                .Sum(b => b.Payment!.Amount);

            return new ClientStatsDto
            {
                TotalBookings = bookings.Count,
                ActiveBookings = bookings.Count(b => b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.InProgress),
                CompletedBookings = bookings.Count(b => b.Status == BookingStatus.Completed),
                TotalSpent = totalSpent,
                ConfirmedPaid = confirmedPaid,
                PendingAmount = pendingAmount
            };
        }
    }
}
