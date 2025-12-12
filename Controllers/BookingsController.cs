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
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PagedResponse<BookingDto>>> GetAllBookings([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _bookingService.GetAllBookingsAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("my-bookings")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<List<BookingDto>>> GetMyBookings()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var bookings = await _bookingService.GetBookingsByUserAsync(userId);
            return Ok(bookings);
        }

        [HttpGet("owner-bookings")]
        [Authorize(Roles = "CarOwner")]
        public async Task<ActionResult<List<BookingDto>>> GetOwnerBookings()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var bookings = await _bookingService.GetBookingsByCarOwnerAsync(userId);
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBookingById(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Check if user has permission to view this booking
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role != "Admin" && role != "Manager" && booking.UserId != userId)
            {
                return Forbid();
            }

            return Ok(booking);
        }

        [HttpPost]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var booking = await _bookingService.CreateBookingAsync(userId, dto);
            
            if (booking == null)
            {
                return BadRequest(new { message = "Failed to create booking. Car may not be available for the selected dates." });
            }

            return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, booking);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "CarOwner,Admin,Manager")]
        public async Task<ActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var canOverride = role == "Admin" || role == "Manager";

            var result = await _bookingService.UpdateBookingStatusAsync(id, userId, dto.Status, canOverride);
            
            if (!result)
            {
                return BadRequest(new { message = "Failed to update booking status. You may not have permission." });
            }

            return Ok(new { message = "Booking status updated successfully." });
        }

        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelBooking(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var isAdmin = role == "Admin";

            var result = await _bookingService.CancelBookingAsync(id, userId, isAdmin);
            
            if (!result)
            {
                return BadRequest(new { message = "Failed to cancel booking. It may already be completed or you don't have permission." });
            }

            return Ok(new { message = "Booking cancelled successfully." });
        }
    }
}
