using FinalExam3.Models;
using FinalExam3.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FinalExam3.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Check if already seeded
            if (await context.Users.AnyAsync())
            {
                return;
            }

            // Create users for each role
            var users = new List<User>
            {
                new User
                {
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@kigalidrive.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    PhoneNumber = "+250788000001",
                    Role = UserRole.Admin,
                    ApprovalStatus = ApprovalStatus.Approved,
                    IsEmailVerified = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    FirstName = "Manager",
                    LastName = "User",
                    Email = "manager@kigalidrive.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
                    PhoneNumber = "+250788000002",
                    Role = UserRole.Manager,
                    ApprovalStatus = ApprovalStatus.Approved,
                    IsEmailVerified = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    FirstName = "Ntiganzwa",
                    LastName = "Kagimba",
                    Email = "tnkagimba@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
                    PhoneNumber = "+250780873647",
                    Role = UserRole.Manager,
                    ApprovalStatus = ApprovalStatus.Approved,
                    IsEmailVerified = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    FirstName = "Owner",
                    LastName = "User",
                    Email = "owner@kigalidrive.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner123!"),
                    PhoneNumber = "+250788000003",
                    Role = UserRole.CarOwner,
                    ApprovalStatus = ApprovalStatus.Approved, // Pre-approved for testing
                    IsEmailVerified = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    FirstName = "Client",
                    LastName = "User",
                    Email = "client@kigalidrive.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Client123!"),
                    PhoneNumber = "+250788000004",
                    Role = UserRole.Client,
                    ApprovalStatus = ApprovalStatus.Approved,
                    IsEmailVerified = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();

            // Add sample cars for the owner
            var owner = await context.Users.FirstAsync(u => u.Role == UserRole.CarOwner);
            
            var cars = new List<Car>
            {
                new Car
                {
                    Make = "Toyota",
                    Model = "Land Cruiser",
                    Year = 2023,
                    LicensePlate = "RAD 001A",
                    Color = "Pearl White",
                    CarType = "SUV",
                    Seats = 7,
                    Transmission = "Automatic",
                    FuelType = "Diesel",
                    PricePerDay = 150.00m,
                    Description = "Luxury SUV perfect for safari adventures and city driving. Fully loaded with premium features.",
                    ImageUrl = "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800",
                    Location = "Kigali, Rwanda",
                    Status = CarStatus.Available,
                    IsAvailable = true,
                    OwnerId = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Make = "Mercedes-Benz",
                    Model = "E-Class",
                    Year = 2024,
                    LicensePlate = "RAD 002B",
                    Color = "Obsidian Black",
                    CarType = "Sedan",
                    Seats = 5,
                    Transmission = "Automatic",
                    FuelType = "Petrol",
                    PricePerDay = 200.00m,
                    Description = "Executive sedan with premium comfort and cutting-edge technology. Perfect for business travel.",
                    ImageUrl = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
                    Location = "Kigali, Rwanda",
                    Status = CarStatus.Available,
                    IsAvailable = true,
                    OwnerId = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Make = "Range Rover",
                    Model = "Sport",
                    Year = 2023,
                    LicensePlate = "RAD 003C",
                    Color = "Santorini Black",
                    CarType = "SUV",
                    Seats = 5,
                    Transmission = "Automatic",
                    FuelType = "Diesel",
                    PricePerDay = 250.00m,
                    Description = "Premium luxury SUV combining sophistication with off-road capability.",
                    ImageUrl = "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
                    Location = "Kigali, Rwanda",
                    Status = CarStatus.Available,
                    IsAvailable = true,
                    OwnerId = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Make = "BMW",
                    Model = "X5",
                    Year = 2024,
                    LicensePlate = "RAD 004D",
                    Color = "Alpine White",
                    CarType = "SUV",
                    Seats = 5,
                    Transmission = "Automatic",
                    FuelType = "Hybrid",
                    PricePerDay = 220.00m,
                    Description = "Sporty luxury SUV with exceptional performance and eco-friendly hybrid technology.",
                    ImageUrl = "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
                    Location = "Kigali, Rwanda",
                    Status = CarStatus.Available,
                    IsAvailable = true,
                    OwnerId = owner.Id,
                    CreatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Make = "Honda",
                    Model = "CR-V",
                    Year = 2023,
                    LicensePlate = "RAD 005E",
                    Color = "Modern Steel",
                    CarType = "SUV",
                    Seats = 5,
                    Transmission = "Automatic",
                    FuelType = "Petrol",
                    PricePerDay = 80.00m,
                    Description = "Reliable and fuel-efficient compact SUV. Great for families and everyday use.",
                    ImageUrl = "https://images.unsplash.com/photo-1568844293986-8c1a5c22d239?w=800",
                    Location = "Kigali, Rwanda",
                    Status = CarStatus.Available,
                    IsAvailable = true,
                    OwnerId = owner.Id,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Cars.AddRangeAsync(cars);
            await context.SaveChangesAsync();

            // Create sample bookings
            var client = await context.Users.FirstAsync(u => u.Role == UserRole.Client);
            var firstCar = await context.Cars.FirstAsync();

            var booking = new Booking
            {
                UserId = client.Id,
                CarId = firstCar.Id,
                StartDate = DateTime.UtcNow.AddDays(7),
                EndDate = DateTime.UtcNow.AddDays(10),
                PickupLocation = "Kigali International Airport",
                DropoffLocation = "Kigali International Airport",
                TotalPrice = firstCar.PricePerDay * 3,
                Status = BookingStatus.Confirmed,
                CreatedAt = DateTime.UtcNow
            };

            await context.Bookings.AddAsync(booking);
            await context.SaveChangesAsync();

            // Create payment for the booking
            var payment = new Payment
            {
                BookingId = booking.Id,
                Amount = booking.TotalPrice,
                Status = PaymentStatus.Pending,
                PaymentMethod = "Card",
                CreatedAt = DateTime.UtcNow
            };

            await context.Payments.AddAsync(payment);
            await context.SaveChangesAsync();

            // Create sample notifications
            var notifications = new List<Notification>
            {
                new Notification
                {
                    UserId = owner.Id,
                    Title = "New Booking Request",
                    Message = $"You have a new booking request for your {firstCar.Make} {firstCar.Model}.",
                    Type = NotificationType.BookingCreated,
                    RelatedEntityId = booking.Id,
                    RelatedEntityType = "Booking",
                    CreatedAt = DateTime.UtcNow
                },
                new Notification
                {
                    UserId = client.Id,
                    Title = "Booking Confirmed",
                    Message = $"Your booking for {firstCar.Make} {firstCar.Model} has been confirmed.",
                    Type = NotificationType.BookingConfirmed,
                    RelatedEntityId = booking.Id,
                    RelatedEntityType = "Booking",
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Notifications.AddRangeAsync(notifications);
            await context.SaveChangesAsync();
        }
    }
}
