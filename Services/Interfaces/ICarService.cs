using FinalExam3.DTOs;
using FinalExam3.Models.Enums;

namespace FinalExam3.Services.Interfaces
{
    public interface ICarService
    {
        Task<PagedResponse<CarDto>> GetAllCarsAsync(CarSearchDto search);
        Task<PagedResponse<CarDto>> GetAvailableCarsAsync(CarSearchDto search);
        Task<List<CarDto>> GetCarsByOwnerAsync(int ownerId);
        Task<CarDto?> GetCarByIdAsync(int id);
        Task<CarDto?> CreateCarAsync(int ownerId, CreateCarDto dto);
        Task<bool> UpdateCarAsync(int id, int requesterId, UpdateCarDto dto, bool isAdmin = false);
        Task<bool> DeleteCarAsync(int id, int requesterId, bool isAdmin = false);
        Task<bool> ApproveCarAsync(int id, CarStatus status);
        Task<List<CarDto>> GetPendingCarsAsync();
        Task<List<CarDto>> GetRecommendedCarsAsync(int count = 5);
        Task<UserDto?> GetOwnerByIdAsync(int ownerId);
    }
}
