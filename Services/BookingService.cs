using FinalExam3.Data;
using FinalExam3.DTOs;
using FinalExam3.Models;
using FinalExam3.Models.Enums;
using FinalExam3.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalExam3.Services
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public BookingService(
            ApplicationDbContext context,
            INotificationService notificationService,
            IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<PagedResponse<BookingDto>> GetAllBookingsAsync(int page, int pageSize)
        {
            var query = _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Car)
                .Include(b => b.Payment)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResponse<BookingDto>
            {
                Items = bookings.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<List<BookingDto>> GetBookingsByUserAsync(int userId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Car)
                .Include(b => b.Payment)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return bookings.Select(MapToDto).ToList();
        }

        public async Task<List<BookingDto>> GetBookingsByCarOwnerAsync(int ownerId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Car)
                .Include(b => b.Payment)
                .Where(b => b.Car.OwnerId == ownerId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return bookings.Select(MapToDto).ToList();
        }

        public async Task<BookingDto?> GetBookingByIdAsync(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Car)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == id);

            return booking != null ? MapToDto(booking) : null;
        }

        public async Task<BookingDto?> CreateBookingAsync(int userId, CreateBookingDto dto)
        {
            // Validate car availability
            var car = await _context.Cars.FindAsync(dto.CarId);
            if (car == null || !car.IsAvailable || car.Status != CarStatus.Available)
            {
                return null;
            }

            // Check for conflicting bookings
            var hasConflict = await _context.Bookings
                .AnyAsync(b => b.CarId == dto.CarId &&
                              b.Status != BookingStatus.Cancelled &&
                              b.StartDate < dto.EndDate &&
                              b.EndDate > dto.StartDate);

            if (hasConflict)
            {
                return null;
            }

            // Calculate total price
            var days = (dto.EndDate - dto.StartDate).Days;
            if (days < 1) days = 1;
            var totalPrice = days * car.PricePerDay;

            var booking = new Booking
            {
                UserId = userId,
                CarId = dto.CarId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PickupLocation = dto.PickupLocation ?? car.Location,
                DropoffLocation = dto.DropoffLocation ?? car.Location,
                TotalPrice = totalPrice,
                Status = BookingStatus.Pending,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Create payment record
            var payment = new Payment
            {
                BookingId = booking.Id,
                Amount = totalPrice,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Notify car owner
            await _notificationService.CreateNotificationAsync(
                car.OwnerId,
                "New Booking Request",
                $"You have a new booking request for your {car.Year} {car.Make} {car.Model}. From {dto.StartDate:MMM dd} to {dto.EndDate:MMM dd}.",
                NotificationType.BookingCreated,
                booking.Id,
                "Booking");

            await _context.Entry(booking).Reference(b => b.User).LoadAsync();
            await _context.Entry(booking).Reference(b => b.Car).LoadAsync();
            await _context.Entry(booking).Reference(b => b.Payment).LoadAsync();

            return MapToDto(booking);
        }

        public async Task<bool> UpdateBookingStatusAsync(int id, int requesterId, BookingStatus status, bool canOverride = false)
        {
            var booking = await _context.Bookings
                .Include(b => b.Car)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return false;

            // Check permissions - car owner can manage their car's bookings
            if (!canOverride && booking.Car.OwnerId != requesterId)
            {
                return false;
            }

            booking.Status = status;
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify the client
            var statusMessage = status switch
            {
                BookingStatus.Confirmed => "Your booking has been confirmed!",
                BookingStatus.InProgress => "Your booking is now in progress. Enjoy your ride!",
                BookingStatus.Completed => "Your booking has been completed. Thank you for using KigaliDrive!",
                BookingStatus.Cancelled => "Your booking has been cancelled.",
                _ => $"Your booking status has been updated to {status}."
            };

            await _notificationService.CreateNotificationAsync(
                booking.UserId,
                $"Booking {status}",
                statusMessage,
                status == BookingStatus.Confirmed ? NotificationType.BookingConfirmed : NotificationType.BookingCancelled,
                booking.Id,
                "Booking");

            // Send email for confirmations
            if (status == BookingStatus.Confirmed)
            {
                await _emailService.SendBookingConfirmationAsync(
                    booking.User.Email,
                    booking.Id,
                    $"{booking.Car.Year} {booking.Car.Make} {booking.Car.Model}",
                    booking.StartDate,
                    booking.EndDate);
            }

            return true;
        }

        public async Task<bool> CancelBookingAsync(int id, int userId, bool isAdmin = false)
        {
            var booking = await _context.Bookings
                .Include(b => b.Car)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return false;

            // Check permissions - user can cancel their own bookings, admin can cancel any
            if (!isAdmin && booking.UserId != userId)
            {
                return false;
            }

            // Can't cancel completed bookings
            if (booking.Status == BookingStatus.Completed)
            {
                return false;
            }

            booking.Status = BookingStatus.Cancelled;
            booking.UpdatedAt = DateTime.UtcNow;

            // Also cancel/fail the payment if pending
            if (booking.Payment != null && booking.Payment.Status == PaymentStatus.Pending)
            {
                booking.Payment.Status = PaymentStatus.Failed;
            }

            await _context.SaveChangesAsync();

            // Notify the car owner
            await _notificationService.CreateNotificationAsync(
                booking.Car.OwnerId,
                "Booking Cancelled",
                $"A booking for your {booking.Car.Year} {booking.Car.Make} {booking.Car.Model} has been cancelled.",
                NotificationType.BookingCancelled,
                booking.Id,
                "Booking");

            return true;
        }

        private BookingDto MapToDto(Booking booking)
        {
            return new BookingDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                UserName = booking.User != null ? $"{booking.User.FirstName} {booking.User.LastName}" : "",
                UserEmail = booking.User?.Email ?? "",
                UserPhone = booking.User?.PhoneNumber,
                CarId = booking.CarId,
                CarName = booking.Car != null ? $"{booking.Car.Year} {booking.Car.Make} {booking.Car.Model}" : "",
                CarImage = booking.Car?.ImageUrl ?? "",
                StartDate = booking.StartDate,
                EndDate = booking.EndDate,
                PickupLocation = booking.PickupLocation,
                DropoffLocation = booking.DropoffLocation,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status.ToString(),
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt,
                Payment = booking.Payment != null ? new PaymentDto
                {
                    Id = booking.Payment.Id,
                    BookingId = booking.Payment.BookingId,
                    Amount = booking.Payment.Amount,
                    Status = booking.Payment.Status.ToString(),
                    PaymentMethod = booking.Payment.PaymentMethod,
                    TransactionReference = booking.Payment.TransactionReference,
                    CreatedAt = booking.Payment.CreatedAt,
                    PaidAt = booking.Payment.PaidAt
                } : null
            };
        }
    }
}
