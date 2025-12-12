using FinalExam3.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalExam3.Models
{
    public class Car
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Make { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Model { get; set; } = string.Empty;

        [Required]
        public int Year { get; set; }

        [Required]
        [StringLength(50)]
        public string LicensePlate { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Color { get; set; }

        [Required]
        [StringLength(50)]
        public string CarType { get; set; } = string.Empty; // SUV, Sedan, Hatchback, etc.

        [Required]
        public int Seats { get; set; } = 5;

        [Required]
        [StringLength(50)]
        public string Transmission { get; set; } = "Automatic"; // Automatic, Manual

        [Required]
        [StringLength(50)]
        public string FuelType { get; set; } = "Petrol"; // Petrol, Diesel, Electric, Hybrid

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerDay { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? ImageUrl { get; set; }

        public string? AdditionalImages { get; set; } // JSON array of image URLs

        [StringLength(200)]
        public string? Location { get; set; }

        public CarStatus Status { get; set; } = CarStatus.PendingApproval;

        public bool IsAvailable { get; set; } = true;

        public int OwnerId { get; set; }
        public User Owner { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
