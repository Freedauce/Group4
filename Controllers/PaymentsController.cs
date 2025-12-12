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
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentById(int id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            
            if (payment == null)
            {
                return NotFound(new { message = "Payment not found." });
            }

            return Ok(payment);
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentByBookingId(int bookingId)
        {
            var payment = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
            
            if (payment == null)
            {
                return NotFound(new { message = "Payment not found." });
            }

            return Ok(payment);
        }

        [HttpGet("my-payments")]
        [Authorize(Roles = "CarOwner")]
        public async Task<ActionResult<List<PaymentDto>>> GetMyPayments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var payments = await _paymentService.GetPaymentsByOwnerAsync(userId);
            return Ok(payments);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "CarOwner,Admin")]
        public async Task<ActionResult<List<PaymentDto>>> GetPendingPayments()
        {
            var payments = await _paymentService.GetPendingPaymentsAsync();
            return Ok(payments);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "CarOwner")]
        public async Task<ActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _paymentService.UpdatePaymentStatusAsync(id, userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "Failed to update payment status. You may not have permission." });
            }

            return Ok(new { message = "Payment status updated successfully." });
        }
    }
}
