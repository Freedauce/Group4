using FinalExam3.DTOs.Auth;
using FinalExam3.Models;
using FinalExam3.Models.Enums;

namespace FinalExam3.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> InitiateLoginAsync(LoginDto dto);
        Task<AuthResponseDto> VerifyLoginCodeAsync(string email, string code);
        Task<AuthResponseDto> InitiateGoogleLoginAsync(string email, string firstName, string lastName, UserRole role);
        Task<AuthResponseDto> GoogleAuthAsync(string email, string firstName, string lastName, UserRole role);
        Task<AuthResponseDto> RefreshTokenAsync(string token);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<bool> VerifyEmailAsync(string token);
        Task<bool> ResendLoginCodeAsync(string email);
        string GenerateJwtToken(User user);
    }
}
