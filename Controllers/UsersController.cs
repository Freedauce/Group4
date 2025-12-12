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
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResponse<UserDto>>> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _userService.GetAllUsersAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(user);
        }

        [HttpGet("pending-approvals")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<List<UserDto>>> GetPendingApprovals()
        {
            var users = await _userService.GetPendingApprovalsAsync();
            return Ok(users);
        }

        [HttpGet("profile")]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _userService.GetUserByIdAsync(userId);
            
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(user);
        }

        [HttpPut("profile")]
        public async Task<ActionResult> UpdateProfile([FromBody] UpdateUserDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.UpdateUserAsync(userId, dto);
            
            if (!result)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var result = await _userService.UpdateUserAsync(id, dto);
            
            if (!result)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new { message = "User updated successfully." });
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> ApproveUser(int id, [FromBody] ApproveUserDto dto)
        {
            var result = await _userService.ApproveUserAsync(id, dto.ApprovalStatus);
            
            if (!result)
            {
                return NotFound(new { message = "User not found." });
            }

            var statusText = dto.ApprovalStatus == ApprovalStatus.Approved ? "approved" : "rejected";
            return Ok(new { message = $"User has been {statusText}." });
        }

        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateUser(int id)
        {
            var result = await _userService.DeactivateUserAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new { message = "User has been deactivated." });
        }

        [HttpPost("{id}/reactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ReactivateUser(int id)
        {
            var result = await _userService.ReactivateUserAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new { message = "User has been reactivated." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            
            if (!result)
            {
                return BadRequest(new { message = "Cannot delete user. User may have active bookings or was not found." });
            }

            return Ok(new { message = "User has been permanently deleted." });
        }

        [HttpPost("internal")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> CreateInternalUser([FromBody] CreateInternalUserDto dto)
        {
            // Validate role - only Admin and Manager can be created internally
            if (dto.Role != UserRole.Admin && dto.Role != UserRole.Manager)
            {
                return BadRequest(new { message = "Only Admin and Manager roles can be created internally." });
            }

            var user = await _userService.CreateInternalUserAsync(dto);
            
            if (user == null)
            {
                return BadRequest(new { message = "Failed to create user. Email may already be in use." });
            }

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }
    }
}
