using FinalExam3.DTOs;
using FinalExam3.Models.Enums;

namespace FinalExam3.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentDto?> GetPaymentByIdAsync(int id);
        Task<PaymentDto?> GetPaymentByBookingIdAsync(int bookingId);
        Task<List<PaymentDto>> GetPaymentsByOwnerAsync(int ownerId);
        Task<bool> UpdatePaymentStatusAsync(int id, int requesterId, UpdatePaymentStatusDto dto);
        Task<List<PaymentDto>> GetPendingPaymentsAsync();
    }
}
