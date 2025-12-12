using FinalExam3.DTOs;
using FinalExam3.Models.Enums;

namespace FinalExam3.Services.Interfaces
{
    public interface IUserService
    {
        Task<PagedResponse<UserDto>> GetAllUsersAsync(int page, int pageSize);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto?> GetUserByEmailAsync(string email);
        Task<List<UserDto>> GetPendingApprovalsAsync();
        Task<bool> UpdateUserAsync(int id, UpdateUserDto dto);
        Task<bool> ApproveUserAsync(int id, ApprovalStatus status);
        Task<bool> DeactivateUserAsync(int id);
        Task<bool> ReactivateUserAsync(int id);
        Task<bool> DeleteUserAsync(int id);
        Task<UserDto?> CreateInternalUserAsync(CreateInternalUserDto dto);
    }
}
