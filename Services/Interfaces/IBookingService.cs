using FinalExam3.DTOs;
using FinalExam3.Models.Enums;

namespace FinalExam3.Services.Interfaces
{
    public interface IBookingService
    {
        Task<PagedResponse<BookingDto>> GetAllBookingsAsync(int page, int pageSize);
        Task<List<BookingDto>> GetBookingsByUserAsync(int userId);
        Task<List<BookingDto>> GetBookingsByCarOwnerAsync(int ownerId);
        Task<BookingDto?> GetBookingByIdAsync(int id);
        Task<BookingDto?> CreateBookingAsync(int userId, CreateBookingDto dto);
        Task<bool> UpdateBookingStatusAsync(int id, int requesterId, BookingStatus status, bool canOverride = false);
        Task<bool> CancelBookingAsync(int id, int userId, bool isAdmin = false);
    }
}
