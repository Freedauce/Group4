using FinalExam3.Models.Enums;

namespace FinalExam3.DTOs
{
    public class CarDto
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string CarType { get; set; } = string.Empty;
        public int Seats { get; set; }
        public string Transmission { get; set; } = string.Empty;
        public string FuelType { get; set; } = string.Empty;
        public decimal PricePerDay { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public List<string>? AdditionalImages { get; set; }
        public string? Location { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCarDto
    {
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string CarType { get; set; } = string.Empty;
        public int Seats { get; set; } = 5;
        public string Transmission { get; set; } = "Automatic";
        public string FuelType { get; set; } = "Petrol";
        public decimal PricePerDay { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public List<string>? AdditionalImages { get; set; }
        public string? Location { get; set; }
    }

    public class UpdateCarDto
    {
        public string? Make { get; set; }
        public string? Model { get; set; }
        public int? Year { get; set; }
        public string? Color { get; set; }
        public string? CarType { get; set; }
        public int? Seats { get; set; }
        public string? Transmission { get; set; }
        public string? FuelType { get; set; }
        public decimal? PricePerDay { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public List<string>? AdditionalImages { get; set; }
        public string? Location { get; set; }
        public bool? IsAvailable { get; set; }
    }

    public class CarSearchDto
    {
        public string? Location { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? CarType { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinSeats { get; set; }
        public string? Transmission { get; set; }
        public string? FuelType { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class ApproveCarDto
    {
        public CarStatus Status { get; set; }
    }
}
