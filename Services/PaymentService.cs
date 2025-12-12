using FinalExam3.Data;
using FinalExam3.DTOs;
using FinalExam3.Models.Enums;
using FinalExam3.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalExam3.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;
        
        // Platform commission rate (5%)
        private const decimal PLATFORM_FEE_RATE = 0.05m;

        public PaymentService(
            ApplicationDbContext context,
            INotificationService notificationService,
            IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Car)
                        .ThenInclude(c => c.Owner)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            return payment != null ? MapToDto(payment) : null;
        }

        public async Task<PaymentDto?> GetPaymentByBookingIdAsync(int bookingId)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Car)
                        .ThenInclude(c => c.Owner)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);

            return payment != null ? MapToDto(payment) : null;
        }

        public async Task<List<PaymentDto>> GetPaymentsByOwnerAsync(int ownerId)
        {
            var payments = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Car)
                        .ThenInclude(c => c.Owner)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Where(p => p.Booking.Car.OwnerId == ownerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return payments.Select(MapToDto).ToList();
        }

        public async Task<bool> UpdatePaymentStatusAsync(int id, int requesterId, UpdatePaymentStatusDto dto)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Car)
                        .ThenInclude(c => c.Owner)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null) return false;

            // Only car owner can approve payments for their cars
            if (payment.Booking.Car.OwnerId != requesterId)
            {
                return false;
            }

            payment.Status = dto.Status;
            if (!string.IsNullOrEmpty(dto.PaymentMethod))
                payment.PaymentMethod = dto.PaymentMethod;
            if (!string.IsNullOrEmpty(dto.Notes))
                payment.Notes = dto.Notes;

            if (dto.Status == PaymentStatus.Paid)
            {
                payment.PaidAt = DateTime.UtcNow;
                payment.TransactionReference = $"TXN-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

                // Update booking to Active (confirmed and in progress)
                payment.Booking.Status = BookingStatus.Confirmed;
                payment.Booking.UpdatedAt = DateTime.UtcNow;
                
                // Calculate commission
                var platformFee = payment.Amount * PLATFORM_FEE_RATE;
                var ownerPayout = payment.Amount - platformFee;
                
                var car = payment.Booking.Car;
                var owner = car.Owner;
                var client = payment.Booking.User;

                // Notify the CLIENT - booking is now active + owner contact info
                await _notificationService.CreateNotificationAsync(
                    client.Id,
                    "🎉 Booking Confirmed - Your car is ready!",
                    $"Your booking for {car.Year} {car.Make} {car.Model} is now ACTIVE!\n\n" +
                    $"📅 Dates: {payment.Booking.StartDate:MMM dd} - {payment.Booking.EndDate:MMM dd}\n" +
                    $"📞 Owner Contact: {owner.PhoneNumber ?? "N/A"}\n" +
                    $"📧 Owner Email: {owner.Email}\n\n" +
                    $"Amount Paid: ${payment.Amount:F2}",
                    NotificationType.PaymentReceived,
                    payment.Id,
                    "Payment");

                // Notify the OWNER - car is booked + payout info
                await _notificationService.CreateNotificationAsync(
                    owner.Id,
                    "💰 Payment Confirmed - Car Booked!",
                    $"Your car {car.Year} {car.Make} {car.Model} has been booked!\n\n" +
                    $"📅 Dates: {payment.Booking.StartDate:MMM dd} - {payment.Booking.EndDate:MMM dd}\n" +
                    $"👤 Customer: {client.FirstName} {client.LastName}\n" +
                    $"📞 Customer Phone: {client.PhoneNumber ?? "N/A"}\n\n" +
                    $"💵 Total Amount: ${payment.Amount:F2}\n" +
                    $"🏢 Platform Fee (5%): ${platformFee:F2}\n" +
                    $"✅ Your Payout: ${ownerPayout:F2}",
                    NotificationType.BookingConfirmed,
                    payment.BookingId,
                    "Booking");

                // Send emails
                await _emailService.SendPaymentConfirmationAsync(
                    client.Email,
                    payment.Amount,
                    payment.TransactionReference!);

                // Send owner contact info to client
                await _emailService.SendOwnerContactEmailAsync(
                    client.Email,
                    $"{client.FirstName} {client.LastName}",
                    $"{car.Year} {car.Make} {car.Model}",
                    $"{owner.FirstName} {owner.LastName}",
                    owner.PhoneNumber ?? "Not Available",
                    owner.Email,
                    payment.Booking.StartDate,
                    payment.Booking.EndDate);
                    
                // Log for admin (simulated)
                Console.WriteLine($"[PLATFORM FEE] Payment #{payment.Id}: Total ${payment.Amount:F2}, Platform Fee ${platformFee:F2}, Owner Payout ${ownerPayout:F2}");
            }
            else if (dto.Status == PaymentStatus.Failed)
            {
                // Update booking to cancelled
                payment.Booking.Status = BookingStatus.Cancelled;
                payment.Booking.UpdatedAt = DateTime.UtcNow;
                
                await _notificationService.CreateNotificationAsync(
                    payment.Booking.UserId,
                    "Payment Failed",
                    $"Your payment of ${payment.Amount:F2} could not be processed. The booking has been cancelled. Please try again or contact support.",
                    NotificationType.PaymentReceived,
                    payment.Id,
                    "Payment");
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<PaymentDto>> GetPendingPaymentsAsync()
        {
            var payments = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b.Car)
                        .ThenInclude(c => c.Owner)
                .Include(p => p.Booking)
                    .ThenInclude(b => b.User)
                .Where(p => p.Status == PaymentStatus.Pending)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync();

            return payments.Select(MapToDto).ToList();
        }

        private PaymentDto MapToDto(Models.Payment payment)
        {
            var platformFee = payment.Amount * PLATFORM_FEE_RATE;
            var ownerPayout = payment.Amount - platformFee;
            
            return new PaymentDto
            {
                Id = payment.Id,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                Status = payment.Status.ToString(),
                PaymentStatus = (int)payment.Status,
                PaymentMethod = payment.PaymentMethod,
                TransactionReference = payment.TransactionReference,
                CreatedAt = payment.CreatedAt,
                PaidAt = payment.PaidAt,
                
                // Commission
                PlatformFee = platformFee,
                OwnerPayout = ownerPayout,
                
                // Car info
                CarName = payment.Booking?.Car != null 
                    ? $"{payment.Booking.Car.Year} {payment.Booking.Car.Make} {payment.Booking.Car.Model}" 
                    : null,
                StartDate = payment.Booking?.StartDate,
                EndDate = payment.Booking?.EndDate,
                
                // Customer info
                CustomerName = payment.Booking?.User != null 
                    ? $"{payment.Booking.User.FirstName} {payment.Booking.User.LastName}" 
                    : null,
                CustomerEmail = payment.Booking?.User?.Email,
                CustomerPhone = payment.Booking?.User?.PhoneNumber,
                
                // Owner info (for client)
                OwnerName = payment.Booking?.Car?.Owner != null 
                    ? $"{payment.Booking.Car.Owner.FirstName} {payment.Booking.Car.Owner.LastName}" 
                    : null,
                OwnerPhone = payment.Booking?.Car?.Owner?.PhoneNumber,
                OwnerEmail = payment.Booking?.Car?.Owner?.Email
            };
        }
    }
}
