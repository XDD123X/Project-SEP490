using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Services;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public AuthController(IAccountRepository accountRepository, IPasswordService passwordService, ITokenService tokenService, IRefreshTokenRepository refreshTokenRepository)
        {
            _accountRepository = accountRepository;
            _passwordService = passwordService;
            _tokenService = tokenService;
            _refreshTokenRepository = refreshTokenRepository;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDTO loginDTO)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(loginDTO.Email) || string.IsNullOrEmpty(loginDTO.Password))
                {
                    return BadRequest("Email and password cannot be empty.");
                }

                var hashedPassword = _passwordService.HashPassword(loginDTO.Password);
                Account account = await _accountRepository.GetByLogin(loginDTO.Email, hashedPassword);

                if (account == null)
                {
                    return NotFound("Incorrect email or password.");
                }

                if (account.Status == 0)
                {
                    return StatusCode(403, "Your account has been locked.");
                }

                var accessToken = _tokenService.GenerateAccessToken(account);

                if (loginDTO.RememberMe)
                {
                    var refreshToken = _tokenService.GenerateRefreshToken();
                    await _refreshTokenRepository.AddAsync(refreshToken, account.AccountId);
                    Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTime.UtcNow.AddDays(7)
                    });
                }

                return Ok(new
                {
                    accessToken = accessToken,
                    user = new
                    {
                        uid = account.AccountId,
                        email = account.Email,
                        role = account.Role.Name,
                    }
                });
            }
            catch (TaskCanceledException)
            {
                return StatusCode(408, "Login request timed out, please try again.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }

        [HttpGet("refresh-token")]
        public async Task<ActionResult> RefreshToken()
        {
            if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken)) return Unauthorized();

            var refreshTokenObj = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (refreshTokenObj == null || refreshTokenObj.ExpiresAt <= DateTime.UtcNow) return Unauthorized();

            var account = await _accountRepository.GetByIdAsync(refreshTokenObj.AccountId);
            if (account == null) return Unauthorized();

            var newAccessToken = _tokenService.GenerateAccessToken(account);

            return Ok(new
            {
                accessToken = newAccessToken,
                account = new
                {
                    uid = account.AccountId,
                    email = account.Email,
                    role = account.Role.Name
                }
            });
        }

        [HttpPost("logout")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> Logout()
        {

            var email = User.FindFirst("ue")?.Value;
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized("Email not found in token");

            }

            var user = await _accountRepository.GetByEmailAsync(email);
            if (user == null) return NotFound("User Not Found");

            //delete cookies
            Response.Cookies.Delete("refreshToken");

            //revoke token
            await _refreshTokenRepository.RevokeByUserIdAsync(user.AccountId);

            return Ok("Logged out successfully");
        }

        [HttpGet("Me")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> Me()
        {
            try
            {
                var email = User.FindFirst("ue")?.Value;
                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized("Email not found in token");

                }

                var user = await _accountRepository.GetByEmailAsync(email);
                if (user == null) return NotFound("User Not Found");

                return Ok(new
                {
                    AccountId = user.AccountId,
                    Email = user.Email,
                    Fullname = user.FullName,
                    Phone = user.PhoneNumber,
                    Dob = user.Dob,
                    ImgUrl = user.ImgUrl,
                    Role = user.Role.Name,
                    Schedule = user.LecturerSchedules.Count()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("profile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> UpdateProfile(UpdateProfileDTO updateProfileDTO)
        {
            try
            {
                var email = User.FindFirst("ue")?.Value;
                if (string.IsNullOrEmpty(email)) return Unauthorized("Email not found in token");

                var user = await _accountRepository.GetByEmailAsync(email);
                if (user == null) return NotFound("User not found");

                user.FullName = updateProfileDTO.FullName;
                user.PhoneNumber = updateProfileDTO.Phone;
                user.Dob = updateProfileDTO.Dob;

                await _accountRepository.UpdateAsync(user);

                return Ok("Profile updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("change-password")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> ChangePassword(ChangePasswordDTO changePasswordDTO)
        {
            try
            {
                var email = User.FindFirst("ue")?.Value;
                if (string.IsNullOrEmpty(email)) return Unauthorized("Email not found in token");

                var user = await _accountRepository.GetByEmailAsync(email);
                if (user == null) return NotFound("User not found");

                string oldhashed = user.Password;

                if (_passwordService.HashPassword(changePasswordDTO.OldPassword) != oldhashed)
                {
                    return BadRequest("Old password is incorrect");
                }

                if (changePasswordDTO.NewPassword != changePasswordDTO.ReNewPassword)
                {
                    return BadRequest("New passwords do not match");
                }

                user.Password = _passwordService.HashPassword(changePasswordDTO.NewPassword);
                await _accountRepository.UpdateAsync(user);

                return Ok("Password changed successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("avatar")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> UpdateAvatar(UpdateProfileDTO updateProfileDTO)
        {
            try
            {
                var email = User.FindFirst("ue")?.Value;
                if (string.IsNullOrEmpty(email)) return Unauthorized("Email not found in token");

                var user = await _accountRepository.GetByEmailAsync(email);
                if (user == null) return NotFound("User not found");

                user.ImgUrl = updateProfileDTO.ImgUrl;

                await _accountRepository.UpdateAsync(user);

                return Ok("Profile updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


    }
}
