using FinalExam3.Data;
using FinalExam3.DTOs;
using FinalExam3.Models;
using FinalExam3.Models.Enums;
using FinalExam3.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinalExam3.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public UserService(
            ApplicationDbContext context,
            IEmailService emailService,
            INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        public async Task<PagedResponse<UserDto>> GetAllUsersAsync(int page, int pageSize)
        {
            var query = _context.Users.AsQueryable();
            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResponse<UserDto>
            {
                Items = users.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user != null ? MapToDto(user) : null;
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user != null ? MapToDto(user) : null;
        }

        public async Task<List<UserDto>> GetPendingApprovalsAsync()
        {
            var users = await _context.Users
                .Where(u => u.ApprovalStatus == ApprovalStatus.Pending)
                .OrderBy(u => u.CreatedAt)
                .ToListAsync();

            return users.Select(MapToDto).ToList();
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            if (!string.IsNullOrEmpty(dto.FirstName))
                user.FirstName = dto.FirstName;
            if (!string.IsNullOrEmpty(dto.LastName))
                user.LastName = dto.LastName;
            if (dto.PhoneNumber != null)
                user.PhoneNumber = dto.PhoneNumber;

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveUserAsync(int id, ApprovalStatus status)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.ApprovalStatus = status;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send notification email
            var approved = status == ApprovalStatus.Approved;
            await _emailService.SendApprovalNotificationAsync(
                user.Email,
                approved,
                approved
                    ? "You can now login to your KigaliDrive account."
                    : "Please contact support for more information.");

            // Create in-app notification
            await _notificationService.CreateNotificationAsync(
                user.Id,
                approved ? "Account Approved" : "Account Rejected",
                approved
                    ? "Your KigaliDrive account has been approved. You can now login and start listing your cars."
                    : "Your KigaliDrive account application was not approved. Please contact support for more details.",
                approved ? NotificationType.AccountApproved : NotificationType.AccountRejected);

            return true;
        }

        public async Task<bool> DeactivateUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReactivateUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            
            // Notify user that their account is reactivated
            await _notificationService.CreateNotificationAsync(
                user.Id,
                "Account Reactivated",
                "Your Kigali Rental account has been reactivated. You can now login and use all features.",
                NotificationType.AccountApproved);
            
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            // Delete user's notifications
            var notifications = await _context.Notifications.Where(n => n.UserId == id).ToListAsync();
            _context.Notifications.RemoveRange(notifications);

            // Delete user's bookings and their payments
            var bookings = await _context.Bookings
                .Include(b => b.Payment)
                .Where(b => b.UserId == id)
                .ToListAsync();
            
            foreach (var booking in bookings)
            {
                if (booking.Payment != null)
                {
                    _context.Payments.Remove(booking.Payment);
                }
            }
            _context.Bookings.RemoveRange(bookings);

            // If user is a car owner, delete their cars and related bookings
            var cars = await _context.Cars
                .Include(c => c.Bookings)
                    .ThenInclude(b => b.Payment)
                .Where(c => c.OwnerId == id)
                .ToListAsync();
            
            foreach (var car in cars)
            {
                foreach (var booking in car.Bookings)
                {
                    if (booking.Payment != null)
                    {
                        _context.Payments.Remove(booking.Payment);
                    }
                }
                _context.Bookings.RemoveRange(car.Bookings);
            }
            _context.Cars.RemoveRange(cars);

            // Delete password reset tokens
            var tokens = await _context.PasswordResetTokens.Where(t => t.UserId == id).ToListAsync();
            _context.PasswordResetTokens.RemoveRange(tokens);

            // Delete user
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<UserDto?> CreateInternalUserAsync(CreateInternalUserDto dto)
        {
            // Only Admin and Manager can be created internally
            if (dto.Role != UserRole.Admin && dto.Role != UserRole.Manager)
            {
                return null;
            }

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return null;
            }

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                PhoneNumber = dto.PhoneNumber,
                Role = dto.Role,
                ApprovalStatus = ApprovalStatus.Approved,
                IsEmailVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToDto(user);
        }

        private UserDto MapToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                ApprovalStatus = user.ApprovalStatus.ToString(),
                IsEmailVerified = user.IsEmailVerified,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };
        }
    }
}
