using FinalExam3.DTOs;
using FinalExam3.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinalExam3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("dashboard")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            try
            {
                var stats = await _reportService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpGet("bookings-by-month")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<List<BookingsByMonthDto>>> GetBookingsByMonth([FromQuery] int? year)
        {
            var targetYear = year ?? DateTime.UtcNow.Year;
            var data = await _reportService.GetBookingsByMonthAsync(targetYear);
            return Ok(data);
        }

        [HttpGet("cars-by-type")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<List<CarsByTypeDto>>> GetCarsByType()
        {
            var data = await _reportService.GetCarsByTypeAsync();
            return Ok(data);
        }

        [HttpGet("revenue")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<List<RevenueReportDto>>> GetRevenueReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;
            var data = await _reportService.GetRevenueReportAsync(start, end);
            return Ok(data);
        }

        [HttpGet("owner-stats")]
        [Authorize(Roles = "CarOwner")]
        public async Task<ActionResult<OwnerStatsDto>> GetOwnerStats()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var stats = await _reportService.GetOwnerStatsAsync(userId);
            return Ok(stats);
        }

        [HttpGet("client-stats")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ClientStatsDto>> GetClientStats()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var stats = await _reportService.GetClientStatsAsync(userId);
            return Ok(stats);
        }
    }
}
