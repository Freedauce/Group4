using FinalExam3.DTOs;
using FinalExam3.DTOs.Auth;
using FinalExam3.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace FinalExam3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.InitiateLoginAsync(dto);
            
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [HttpPost("verify-code")]
        public async Task<ActionResult<AuthResponseDto>> VerifyCode([FromBody] VerifyCodeDto dto)
        {
            var result = await _authService.VerifyLoginCodeAsync(dto.Email, dto.Code);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("resend-code")]
        public async Task<ActionResult> ResendCode([FromBody] ResendCodeDto dto)
        {
            var success = await _authService.ResendLoginCodeAsync(dto.Email);
            
            if (!success)
            {
                return BadRequest(new { message = "User not found" });
            }

            return Ok(new { message = "Verification code resent" });
        }

        [HttpPost("google")]
        public async Task<ActionResult<AuthResponseDto>> GoogleAuth([FromBody] GoogleAuthDto dto)
        {
            try
            {
                // Verify the Google token
                var googleClientId = _configuration["GoogleAuth:ClientId"];
                var tokenInfoUrl = $"https://oauth2.googleapis.com/tokeninfo?id_token={dto.Credential}";
                
                var response = await _httpClient.GetAsync(tokenInfoUrl);
                
                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new AuthResponseDto 
                    { 
                        Success = false, 
                        Message = "Invalid Google token" 
                    });
                }

                var content = await response.Content.ReadAsStringAsync();
                var googleUser = JsonSerializer.Deserialize<GoogleUserInfo>(content, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });

                if (googleUser == null || googleUser.Email == null)
                {
                    return BadRequest(new AuthResponseDto 
                    { 
                        Success = false, 
                        Message = "Unable to get user info from Google" 
                    });
                }

                // Verify the token was issued for our app
                if (googleUser.Aud != googleClientId)
                {
                    return BadRequest(new AuthResponseDto 
                    { 
                        Success = false, 
                        Message = "Token was not issued for this application" 
                    });
                }

                // Try to login or register with Google - direct login
                var result = await _authService.GoogleAuthAsync(
                    googleUser.Email, 
                    googleUser.GivenName ?? googleUser.Name?.Split(' ').FirstOrDefault() ?? "User", 
                    googleUser.FamilyName ?? googleUser.Name?.Split(' ').LastOrDefault() ?? "",
                    dto.Role
                );

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new AuthResponseDto 
                { 
                    Success = false, 
                    Message = $"Google authentication failed: {ex.Message}" 
                });
            }
        }

        [HttpPost("refresh-token")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken()
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Token is required" });
            }

            var result = await _authService.RefreshTokenAsync(token);
            
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await _authService.ForgotPasswordAsync(dto.Email);
            return Ok(new { message = "If the email exists, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var result = await _authService.ResetPasswordAsync(dto);
            
            if (!result)
            {
                return BadRequest(new { message = "Invalid or expired reset token." });
            }

            return Ok(new { message = "Password has been reset successfully." });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _authService.ChangePasswordAsync(userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            return Ok(new { message = "Password changed successfully." });
        }

        [HttpGet("verify-email/{token}")]
        public async Task<ActionResult> VerifyEmail(string token)
        {
            var result = await _authService.VerifyEmailAsync(token);
            
            if (!result)
            {
                return BadRequest(new { message = "Invalid or expired verification token." });
            }

            return Ok(new { message = "Email verified successfully." });
        }

        [HttpGet("me")]
        [Authorize]
        public ActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new 
            { 
                Id = userId,
                Email = email,
                Name = name,
                Role = role
            });
        }
    }

    // Helper class for Google token response
    public class GoogleUserInfo
    {
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? GivenName { get; set; }
        public string? FamilyName { get; set; }
        public string? Picture { get; set; }
        public string? Aud { get; set; }
    }
}
