using FinalExam3.DTOs;
using FinalExam3.Models.Enums;
using FinalExam3.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinalExam3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarsController : ControllerBase
    {
        private readonly ICarService _carService;

        public CarsController(ICarService carService)
        {
            _carService = carService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResponse<CarDto>>> GetAllCars([FromQuery] CarSearchDto search)
        {
            var result = await _carService.GetAllCarsAsync(search);
            return Ok(result);
        }

        [HttpGet("available")]
        public async Task<ActionResult<PagedResponse<CarDto>>> GetAvailableCars([FromQuery] CarSearchDto search)
        {
            var result = await _carService.GetAvailableCarsAsync(search);
            return Ok(result);
        }

        [HttpGet("recommended")]
        public async Task<ActionResult<List<CarDto>>> GetRecommendedCars([FromQuery] int count = 5)
        {
            var cars = await _carService.GetRecommendedCarsAsync(count);
            return Ok(cars);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<List<CarDto>>> GetPendingCars()
        {
            var cars = await _carService.GetPendingCarsAsync();
            return Ok(cars);
        }

        [HttpGet("my-cars")]
        [Authorize(Roles = "CarOwner")]
        public async Task<ActionResult<List<CarDto>>> GetMyCars()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var cars = await _carService.GetCarsByOwnerAsync(userId);
            return Ok(cars);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CarDto>> GetCarById(int id)
        {
            var car = await _carService.GetCarByIdAsync(id);
            
            if (car == null)
            {
                return NotFound(new { message = "Car not found." });
            }

            return Ok(car);
        }

        [HttpPost]
        [Authorize(Roles = "CarOwner,Admin")]
        public async Task<ActionResult<CarDto>> CreateCar([FromBody] CreateCarDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            // Check if user has phone number (required for car owners)
            var user = await _carService.GetOwnerByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.PhoneNumber))
            {
                return BadRequest(new { message = "Phone number required. Please update your profile with a phone number before adding a car.", requiresPhone = true });
            }
            
            var car = await _carService.CreateCarAsync(userId, dto);
            
            if (car == null)
            {
                return BadRequest(new { message = "Failed to create car. License plate may already exist." });
            }

            return CreatedAtAction(nameof(GetCarById), new { id = car.Id }, car);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "CarOwner,Admin")]
        public async Task<ActionResult> UpdateCar(int id, [FromBody] UpdateCarDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var isAdmin = role == "Admin";

            var result = await _carService.UpdateCarAsync(id, userId, dto, isAdmin);
            
            if (!result)
            {
                return NotFound(new { message = "Car not found or you don't have permission to update it." });
            }

            return Ok(new { message = "Car updated successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "CarOwner,Admin")]
        public async Task<ActionResult> DeleteCar(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var isAdmin = role == "Admin";

            var result = await _carService.DeleteCarAsync(id, userId, isAdmin);
            
            if (!result)
            {
                return BadRequest(new { message = "Car not found, you don't have permission, or the car has active bookings." });
            }

            return Ok(new { message = "Car deleted successfully." });
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> ApproveCar(int id, [FromBody] ApproveCarDto dto)
        {
            var result = await _carService.ApproveCarAsync(id, dto.Status);
            
            if (!result)
            {
                return NotFound(new { message = "Car not found." });
            }

            var statusText = dto.Status == CarStatus.Available ? "approved" : "rejected";
            return Ok(new { message = $"Car has been {statusText}." });
        }
    }
}
