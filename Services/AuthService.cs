using FinalExam3.Data;
using FinalExam3.DTOs;
using FinalExam3.DTOs.Auth;
using FinalExam3.Models;
using FinalExam3.Models.Enums;
using FinalExam3.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FinalExam3.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration,
            IEmailService emailService,
            INotificationService notificationService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already registered"
                };
            }

            // Only Client and CarOwner can self-register
            if (dto.Role != UserRole.Client && dto.Role != UserRole.CarOwner)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Only Client and Car Owner roles can self-register. Admin and Manager accounts must be created by an administrator."
                };
            }

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                PhoneNumber = dto.PhoneNumber,
                Role = dto.Role,
                ApprovalStatus = ApprovalStatus.Approved,
                IsEmailVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send 6-digit verification code for registration
            await GenerateAndSendLoginCode(user);

            // Notify admins/managers about new car owner registration
            if (dto.Role == UserRole.CarOwner)
            {
                var admins = await _context.Users
                    .Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Manager)
                    .ToListAsync();

                foreach (var admin in admins)
                {
                    await _notificationService.CreateNotificationAsync(
                        admin.Id,
                        "New Car Owner Registration",
                        $"{user.FirstName} {user.LastName} has registered as a Car Owner.",
                        NotificationType.AccountApproved,
                        user.Id,
                        "User");
                }
            }

            var userDto = MapToUserDto(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Verification code sent to your email. Please verify to complete registration.",
                User = userDto
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Your account has been deactivated. Please contact support."
                };
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            var userDto = MapToUserDto(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = userDto
            };
        }

        public async Task<AuthResponseDto> InitiateLoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Your account has been deactivated. Please contact support."
                };
            }

            // All users login directly - no 2FA needed
            // Email verification happens during registration
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponseDto> VerifyLoginCodeAsync(string email, string code)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return new AuthResponseDto { Success = false, Message = "User not found" };
            }

            // Find valid verification code
            var token = await _context.LoginVerificationTokens
                .Where(t => t.UserId == user.Id && t.Code == code && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();

            if (token == null)
            {
                return new AuthResponseDto { Success = false, Message = "Invalid or expired verification code" };
            }

            // Mark token as used
            token.IsUsed = true;

            // Mark email as verified and update last login
            user.IsEmailVerified = true;
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var jwtToken = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = jwtToken,
                User = MapToUserDto(user)
            };
        }

        public async Task<bool> ResendLoginCodeAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;

            await GenerateAndSendLoginCode(user);
            return true;
        }

        private async Task GenerateAndSendLoginCode(User user)
        {
            // Invalidate old codes
            var oldTokens = await _context.LoginVerificationTokens
                .Where(t => t.UserId == user.Id && !t.IsUsed)
                .ToListAsync();
            foreach (var t in oldTokens) t.IsUsed = true;

            // Generate 6-digit code
            var code = new Random().Next(100000, 999999).ToString();

            var verificationToken = new LoginVerificationToken
            {
                UserId = user.Id,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.LoginVerificationTokens.Add(verificationToken);
            await _context.SaveChangesAsync();

            // Send email
            await _emailService.SendLoginVerificationCodeAsync(user.Email, user.FirstName, code);
        }

        public async Task<AuthResponseDto> GoogleAuthAsync(string email, string firstName, string lastName, UserRole role)
        {
            // Check if user already exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // Only Client and CarOwner can register via Google
                if (role != UserRole.Client && role != UserRole.CarOwner)
                {
                    role = UserRole.Client;
                }

                // Create new user
                user = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random password for Google users
                    Role = role,
                    ApprovalStatus = ApprovalStatus.Approved, // Auto-approve all users including Car Owners
                    IsEmailVerified = true, // Google already verified the email
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Send welcome message from CEO (in-app notification)
                await _notificationService.CreateNotificationAsync(
                    user.Id,
                    "🎉 Welcome to Kigali Rental!",
                    $"Dear {user.FirstName},\n\n" +
                    "Welcome to Kigali Rental! I'm thrilled to have you join our community.\n\n" +
                    "At Kigali Rental, we're committed to providing you with the best car rental experience in Rwanda. " +
                    "Whether you're exploring the beautiful hills of Kigali or embarking on a cross-country adventure, " +
                    "we've got the perfect ride for you.\n\n" +
                    "Feel free to browse our premium selection of vehicles and don't hesitate to reach out if you need any assistance.\n\n" +
                    "Safe travels!\n\n" +
                    "Warm regards,\n" +
                    "Ntiganzwa Kagimba\n" +
                    "CEO, Kigali Rental",
                    NotificationType.AccountApproved,
                    user.Id,
                    "User");

                // Send welcome EMAIL from CEO
                await _emailService.SendCeoWelcomeEmailAsync(user.Email, user.FirstName);

                // Notify admins about new Car Owner (informational only)
                if (role == UserRole.CarOwner)
                {
                    var admins = await _context.Users
                        .Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Manager)
                        .ToListAsync();

                    foreach (var admin in admins)
                    {
                        await _notificationService.CreateNotificationAsync(
                            admin.Id,
                            "New Car Owner Registration (Google)",
                            $"{user.FirstName} {user.LastName} has registered as a Car Owner via Google.",
                            NotificationType.AccountApproved,
                            user.Id,
                            "User");
                    }
                }
            }

            // Check if existing user is active
            if (!user.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Your account has been deactivated. Please contact support."
                };
            }


            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponseDto> InitiateGoogleLoginAsync(string email, string firstName, string lastName, UserRole role)
        {
            // Check if user already exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // Only Client and CarOwner can register via Google
                if (role != UserRole.Client && role != UserRole.CarOwner)
                {
                    role = UserRole.Client;
                }

                // Create new user
                user = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    Role = role,
                    ApprovalStatus = ApprovalStatus.Approved,
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Send welcome message from CEO
                await _notificationService.CreateNotificationAsync(
                    user.Id,
                    "🎉 Welcome to Kigali Rental!",
                    $"Dear {user.FirstName},\n\nWelcome to Kigali Rental! Safe travels!\n\nNtiganzwa Kagimba\nCEO, Kigali Rental",
                    NotificationType.AccountApproved,
                    user.Id,
                    "User");

                await _emailService.SendCeoWelcomeEmailAsync(user.Email, user.FirstName);
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Your account has been deactivated. Please contact support."
                };
            }

            // Generate and send verification code
            await GenerateAndSendLoginCode(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Verification code sent to your email",
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string token)
        {
            // For simplicity, we'll just validate and return a new token
            var principal = GetPrincipalFromToken(token);
            if (principal == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid token"
                };
            }

            var userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            var newToken = GenerateJwtToken(user);
            var userDto = MapToUserDto(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Token refreshed",
                Token = newToken,
                User = userDto
            };
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Don't reveal that the email doesn't exist
                return true;
            }

            var token = new PasswordResetToken
            {
                UserId = user.Id,
                Token = Guid.NewGuid().ToString(),
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                CreatedAt = DateTime.UtcNow
            };

            _context.PasswordResetTokens.Add(token);
            await _context.SaveChangesAsync();

            await _emailService.SendPasswordResetEmailAsync(user.Email, token.Token);

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var token = await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == dto.Token && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow);

            if (token == null)
            {
                return false;
            }

            token.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            token.User.UpdatedAt = DateTime.UtcNow;
            token.IsUsed = true;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return false;
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
            if (user == null)
            {
                return false;
            }

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "KigaliDrive-Super-Secret-Key-2024-Car-Rental-Platform";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "KigaliDrive";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "KigaliDrive";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("ApprovalStatus", user.ApprovalStatus.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private ClaimsPrincipal? GetPrincipalFromToken(string token)
        {
            try
            {
                var jwtKey = _configuration["Jwt:Key"] ?? "KigaliDrive-Super-Secret-Key-2024-Car-Rental-Platform";
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(jwtKey);

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false
                }, out _);

                return principal;
            }
            catch
            {
                return null;
            }
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                ApprovalStatus = user.ApprovalStatus.ToString(),
                IsEmailVerified = user.IsEmailVerified,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };
        }
    }
}
