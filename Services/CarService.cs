using FinalExam3.Data;
using FinalExam3.DTOs;
using FinalExam3.Models;
using FinalExam3.Models.Enums;
using FinalExam3.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FinalExam3.Services
{
    public class CarService : ICarService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;
        private const string MANAGER_EMAIL = "tnkagimba@gmail.com";

        public CarService(ApplicationDbContext context, INotificationService notificationService, IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<PagedResponse<CarDto>> GetAllCarsAsync(CarSearchDto search)
        {
            var query = _context.Cars.Include(c => c.Owner).AsQueryable();

            query = ApplyFilters(query, search);

            var totalCount = await query.CountAsync();

            var cars = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((search.Page - 1) * search.PageSize)
                .Take(search.PageSize)
                .ToListAsync();

            return new PagedResponse<CarDto>
            {
                Items = cars.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page = search.Page,
                PageSize = search.PageSize
            };
        }

        public async Task<PagedResponse<CarDto>> GetAvailableCarsAsync(CarSearchDto search)
        {
            var query = _context.Cars
                .Include(c => c.Owner)
                .Where(c => c.Status == CarStatus.Available && c.IsAvailable)
                .AsQueryable();

            query = ApplyFilters(query, search);

            // Check for date conflicts if dates provided
            if (search.StartDate.HasValue && search.EndDate.HasValue)
            {
                var bookedCarIds = await _context.Bookings
                    .Where(b => b.Status != BookingStatus.Cancelled &&
                                b.StartDate < search.EndDate.Value &&
                                b.EndDate > search.StartDate.Value)
                    .Select(b => b.CarId)
                    .Distinct()
                    .ToListAsync();

                query = query.Where(c => !bookedCarIds.Contains(c.Id));
            }

            var totalCount = await query.CountAsync();

            var cars = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((search.Page - 1) * search.PageSize)
                .Take(search.PageSize)
                .ToListAsync();

            return new PagedResponse<CarDto>
            {
                Items = cars.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page = search.Page,
                PageSize = search.PageSize
            };
        }

        public async Task<List<CarDto>> GetCarsByOwnerAsync(int ownerId)
        {
            var cars = await _context.Cars
                .Include(c => c.Owner)
                .Where(c => c.OwnerId == ownerId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return cars.Select(MapToDto).ToList();
        }

        public async Task<CarDto?> GetCarByIdAsync(int id)
        {
            var car = await _context.Cars
                .Include(c => c.Owner)
                .FirstOrDefaultAsync(c => c.Id == id);

            return car != null ? MapToDto(car) : null;
        }

        public async Task<CarDto?> CreateCarAsync(int ownerId, CreateCarDto dto)
        {
            // Check if owner has a phone number
            var owner = await _context.Users.FindAsync(ownerId);
            if (owner == null || string.IsNullOrEmpty(owner.PhoneNumber))
            {
                return null; // Owner must have phone number to list cars
            }

            // Check if license plate already exists
            if (await _context.Cars.AnyAsync(c => c.LicensePlate == dto.LicensePlate))
            {
                return null;
            }

            var car = new Car
            {
                Make = dto.Make,
                Model = dto.Model,
                Year = dto.Year,
                LicensePlate = dto.LicensePlate,
                Color = dto.Color,
                CarType = dto.CarType,
                Seats = dto.Seats,
                Transmission = dto.Transmission,
                FuelType = dto.FuelType,
                PricePerDay = dto.PricePerDay,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                AdditionalImages = dto.AdditionalImages != null ? JsonSerializer.Serialize(dto.AdditionalImages) : null,
                Location = dto.Location,
                Status = CarStatus.PendingApproval, // Requires manager approval
                IsAvailable = true,
                OwnerId = ownerId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            // Notify admins/managers about new car
            var admins = await _context.Users
                .Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Manager)
                .ToListAsync();

            foreach (var admin in admins)
            {
                await _notificationService.CreateNotificationAsync(
                    admin.Id,
                    "New Car Listed",
                    $"A new {car.Year} {car.Make} {car.Model} has been listed and is pending approval.",
                    NotificationType.CarApproved,
                    car.Id,
                    "Car");
            }

            // Send email to manager
            await _emailService.SendNewCarNotificationAsync(
                MANAGER_EMAIL,
                $"{car.Year} {car.Make} {car.Model}",
                $"{owner.FirstName} {owner.LastName}",
                owner.Email);

            await _context.Entry(car).Reference(c => c.Owner).LoadAsync();
            return MapToDto(car);
        }

        public async Task<bool> UpdateCarAsync(int id, int requesterId, UpdateCarDto dto, bool isAdmin = false)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null) return false;

            // Only owner or admin can update
            if (!isAdmin && car.OwnerId != requesterId) return false;

            if (!string.IsNullOrEmpty(dto.Make)) car.Make = dto.Make;
            if (!string.IsNullOrEmpty(dto.Model)) car.Model = dto.Model;
            if (dto.Year.HasValue) car.Year = dto.Year.Value;
            if (!string.IsNullOrEmpty(dto.Color)) car.Color = dto.Color;
            if (!string.IsNullOrEmpty(dto.CarType)) car.CarType = dto.CarType;
            if (dto.Seats.HasValue) car.Seats = dto.Seats.Value;
            if (!string.IsNullOrEmpty(dto.Transmission)) car.Transmission = dto.Transmission;
            if (!string.IsNullOrEmpty(dto.FuelType)) car.FuelType = dto.FuelType;
            if (dto.PricePerDay.HasValue) car.PricePerDay = dto.PricePerDay.Value;
            if (dto.Description != null) car.Description = dto.Description;
            if (dto.ImageUrl != null) car.ImageUrl = dto.ImageUrl;
            if (dto.AdditionalImages != null) car.AdditionalImages = JsonSerializer.Serialize(dto.AdditionalImages);
            if (dto.Location != null) car.Location = dto.Location;
            if (dto.IsAvailable.HasValue) car.IsAvailable = dto.IsAvailable.Value;

            car.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCarAsync(int id, int requesterId, bool isAdmin = false)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null) return false;

            // Only owner or admin can delete
            if (!isAdmin && car.OwnerId != requesterId) return false;

            // Check for active bookings
            var hasActiveBookings = await _context.Bookings
                .AnyAsync(b => b.CarId == id && 
                              (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.InProgress));
            
            if (hasActiveBookings) return false;

            _context.Cars.Remove(car);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveCarAsync(int id, CarStatus status)
        {
            var car = await _context.Cars.Include(c => c.Owner).FirstOrDefaultAsync(c => c.Id == id);
            if (car == null) return false;

            car.Status = status;
            car.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify the car owner
            var isApproved = status == CarStatus.Available;
            await _notificationService.CreateNotificationAsync(
                car.OwnerId,
                isApproved ? "Car Approved" : "Car Rejected",
                isApproved
                    ? $"Your {car.Year} {car.Make} {car.Model} has been approved and is now visible to customers."
                    : $"Your {car.Year} {car.Make} {car.Model} was not approved. Please contact support for details.",
                isApproved ? NotificationType.CarApproved : NotificationType.CarRejected,
                car.Id,
                "Car");

            return true;
        }

        public async Task<List<CarDto>> GetPendingCarsAsync()
        {
            var cars = await _context.Cars
                .Include(c => c.Owner)
                .Where(c => c.Status == CarStatus.PendingApproval)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return cars.Select(MapToDto).ToList();
        }

        public async Task<List<CarDto>> GetRecommendedCarsAsync(int count = 5)
        {
            // Simple recommendation: random available cars
            var cars = await _context.Cars
                .Include(c => c.Owner)
                .Where(c => c.Status == CarStatus.Available && c.IsAvailable)
                .OrderBy(c => Guid.NewGuid())
                .Take(count)
                .ToListAsync();

            return cars.Select(MapToDto).ToList();
        }

        public async Task<UserDto?> GetOwnerByIdAsync(int ownerId)
        {
            var user = await _context.Users.FindAsync(ownerId);
            if (user == null) return null;

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

        private IQueryable<Car> ApplyFilters(IQueryable<Car> query, CarSearchDto search)
        {
            if (!string.IsNullOrEmpty(search.Location))
            {
                query = query.Where(c => c.Location != null && c.Location.Contains(search.Location));
            }

            if (!string.IsNullOrEmpty(search.CarType))
            {
                query = query.Where(c => c.CarType == search.CarType);
            }

            if (search.MinPrice.HasValue)
            {
                query = query.Where(c => c.PricePerDay >= search.MinPrice.Value);
            }

            if (search.MaxPrice.HasValue)
            {
                query = query.Where(c => c.PricePerDay <= search.MaxPrice.Value);
            }

            if (search.MinSeats.HasValue)
            {
                query = query.Where(c => c.Seats >= search.MinSeats.Value);
            }

            if (!string.IsNullOrEmpty(search.Transmission))
            {
                query = query.Where(c => c.Transmission == search.Transmission);
            }

            if (!string.IsNullOrEmpty(search.FuelType))
            {
                query = query.Where(c => c.FuelType == search.FuelType);
            }

            return query;
        }

        private CarDto MapToDto(Car car)
        {
            List<string>? additionalImages = null;
            if (!string.IsNullOrEmpty(car.AdditionalImages))
            {
                try
                {
                    additionalImages = JsonSerializer.Deserialize<List<string>>(car.AdditionalImages);
                }
                catch { }
            }

            return new CarDto
            {
                Id = car.Id,
                Make = car.Make,
                Model = car.Model,
                Year = car.Year,
                LicensePlate = car.LicensePlate,
                Color = car.Color,
                CarType = car.CarType,
                Seats = car.Seats,
                Transmission = car.Transmission,
                FuelType = car.FuelType,
                PricePerDay = car.PricePerDay,
                Description = car.Description,
                ImageUrl = car.ImageUrl,
                AdditionalImages = additionalImages,
                Location = car.Location,
                Status = car.Status.ToString(),
                IsAvailable = car.IsAvailable,
                OwnerId = car.OwnerId,
                OwnerName = car.Owner != null ? $"{car.Owner.FirstName} {car.Owner.LastName}" : "",
                CreatedAt = car.CreatedAt
            };
        }
    }
}
