using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Services;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Auth
{
    //[Route("api/[controller]")]
    //[ApiController]
    //public class AuthController : ControllerBase
    //{
    //    private readonly IAccountRepository _accountRepository;
    //    private readonly IRefreshTokenRepository _refreshTokenRepository;
    //    private readonly ITokenService _tokenService;
    //    private readonly IPasswordService _passwordService;
    //    private readonly IMemoryCache _cache;
    //    private readonly IEmailService _emailService;

    //    public AuthController(IEmailService emailService, IMemoryCache cache, IAccountRepository accountRepository, IPasswordService passwordService, ITokenService tokenService, IRefreshTokenRepository refreshTokenRepository)
    //    {
    //        _accountRepository = accountRepository;
    //        _passwordService = passwordService;
    //        _tokenService = tokenService;
    //        _refreshTokenRepository = refreshTokenRepository;
    //        _emailService = emailService;
    //        _cache = cache;
    //    }

    //    [HttpPost("login")]
    //    public async Task<IActionResult> Login(LoginDTO loginDTO)
    //    {
    //        try
    //        {
    //            // Validate input
    //            if (string.IsNullOrEmpty(loginDTO.Email) || string.IsNullOrEmpty(loginDTO.Password))
    //            {
    //                return BadRequest("Email and password cannot be empty.");
    //            }

    //            var hashedPassword = _passwordService.HashPassword(loginDTO.Password);
    //            Account account = await _accountRepository.GetByLogin(loginDTO.Email, hashedPassword);

    //            if (account == null)
    //            {
    //                return Unauthorized("Incorrect email or password.");
    //            }

    //            if (account.Status == 0)
    //            {
    //                return StatusCode(403, "Your account has been suspended.");
    //            }

    //            var accessToken = _tokenService.GenerateAccessToken(account);

    //            if (loginDTO.RememberMe)
    //            {
    //                var refreshToken = _tokenService.GenerateRefreshToken();
    //                await _refreshTokenRepository.AddAsync(refreshToken, account.AccountId);
    //                Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
    //                {
    //                    HttpOnly = true,
    //                    Secure = true,
    //                    SameSite = SameSiteMode.Strict,
    //                    Expires = DateTime.UtcNow.AddDays(7)
    //                });
    //            }

    //            return Ok(new
    //            {
    //                accessToken = accessToken,
    //                user = new
    //                {
    //                    uid = account.AccountId,
    //                    email = account.Email,
    //                    role = account.Role.Name,
    //                }
    //            });
    //        }
    //        catch (TaskCanceledException)
    //        {
    //            return StatusCode(408, "Login request timed out, please try again.");
    //        }
    //        catch (Exception ex)
    //        {
    //            return StatusCode(500, $"Server error: {ex.Message}");
    //        }
    //    }

    //    [HttpGet("refresh-token")]
    //    public async Task<IActionResult> RefreshToken()
    //    {
    //        if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken)) return Unauthorized();

    //        var refreshTokenObj = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
    //        if (refreshTokenObj == null || refreshTokenObj.ExpiresAt <= DateTime.UtcNow) return Unauthorized();

    //        var account = await _accountRepository.GetByIdAsync(refreshTokenObj.AccountId);
    //        if (account == null) return Unauthorized();

    //        var newAccessToken = _tokenService.GenerateAccessToken(account);

    //        return Ok(new
    //        {
    //            accessToken = newAccessToken,
    //            account = new
    //            {
    //                uid = account.AccountId,
    //                email = account.Email,
    //                role = account.Role.Name
    //            }
    //        });
    //    }

    //    [HttpPost("logout")]
    //    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    //    public async Task<IActionResult> Logout()
    //    {

    //        var email = User.FindFirst("ue")?.Value;
    //        if (string.IsNullOrEmpty(email))
    //        {
    //            return Unauthorized("Email not found in token");

    //        }

    //        var user = await _accountRepository.GetByEmailAsync(email);
    //        if (user == null) return NotFound("User Not Found");

    //        //delete cookies
    //        Response.Cookies.Delete("refreshToken");

    //        //revoke token
    //        await _refreshTokenRepository.RevokeByUserIdAsync(user.AccountId);

    //        return Ok("Logged out successfully");
    //    }

    //    [HttpGet("Me")]
    //    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    //    public async Task<IActionResult> Me()
    //    {
    //        try
    //        {
    //            var email = User.FindFirst("ue")?.Value;
    //            if (string.IsNullOrEmpty(email))
    //            {
    //                return Unauthorized("Email not found in token");

    //            }

    //            var user = await _accountRepository.GetByEmailAsync(email);
    //            if (user == null) return NotFound("User Not Found");

    //            return Ok(new
    //            {
    //                AccountId = user.AccountId,
    //                Email = user.Email,
    //                Fullname = user.FullName,
    //                Phone = user.PhoneNumber,
    //                Dob = user.Dob,
    //                ImgUrl = user.ImgUrl,
    //                Role = user.Role.Name,
    //                Schedule = user.LecturerSchedules.Count()
    //            });
    //        }
    //        catch (Exception ex)
    //        {
    //            return StatusCode(500, "Internal server error: " + ex.Message);
    //        }
    //    }

    //    [HttpPut("profile")]
    //    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    //    public async Task<IActionResult> UpdateProfile(UpdateProfileDTO updateProfileDTO)
    //    {
    //        try
    //        {
    //            var email = User.FindFirst("ue")?.Value;
    //            if (string.IsNullOrEmpty(email)) return Unauthorized("Email not found in token");

    //            var user = await _accountRepository.GetByEmailAsync(email);
    //            if (user == null) return NotFound("User not found");

    //            user.FullName = updateProfileDTO.FullName;
    //            user.PhoneNumber = updateProfileDTO.Phone;
    //            user.Dob = updateProfileDTO.Dob;

    //            await _accountRepository.UpdateAsync(user);

    //            return Ok("Profile updated successfully");
    //        }
    //        catch (Exception ex)
    //        {
    //            return StatusCode(500, "Internal server error: " + ex.Message);
    //        }
    //    }

    //    [HttpPost("change-password")]
    //    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    //    public async Task<IActionResult> ChangePassword(ChangePasswordDTO changePasswordDTO)
    //    {
    //        try
    //        {
    //            var email = User.FindFirst("ue")?.Value;
    //            if (string.IsNullOrEmpty(email)) return Unauthorized("Email not found in token");

    //            var user = await _accountRepository.GetByEmailAsync(email);
    //            if (user == null) return NotFound("User not found");

    //            string oldhashed = user.Password;

    //            if (_passwordService.HashPassword(changePasswordDTO.OldPassword) != oldhashed)
    //            {
    //                return BadRequest("Old password is incorrect");
    //            }

    //            if (changePasswordDTO.NewPassword != changePasswordDTO.ReNewPassword)
    //            {
    //                return BadRequest("New passwords do not match");
    //            }

    //            user.Password = _passwordService.HashPassword(changePasswordDTO.NewPassword);
    //            await _accountRepository.UpdateAsync(user);

    //            return Ok("Password changed successfully");
    //        }
    //        catch (Exception ex)
    //        {
    //            return StatusCode(500, "Internal server error: " + ex.Message);
    //        }
    //    }

    //    [HttpPut("avatar")]
    //    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    //    public async Task<IActionResult> UpdateAvatar(UpdateProfileDTO updateProfileDTO)
    //    {
    //        try
    //        {
    //            var email = User.FindFirst("ue")?.Value;
    //            if (string.IsNullOrEmpty(email)) return Unauthorized("Email not found in token");

    //            var user = await _accountRepository.GetByEmailAsync(email);
    //            if (user == null) return NotFound("User not found");

    //            user.ImgUrl = updateProfileDTO.ImgUrl;

    //            await _accountRepository.UpdateAsync(user);

    //            return Ok("Profile updated successfully");
    //        }
    //        catch (Exception ex)
    //        {
    //            return StatusCode(500, "Internal server error: " + ex.Message);
    //        }
    //    }

    //    [HttpPost("request-otp/{email}")]
    //    public async Task<IActionResult> RequestOtp(string email)
    //    {
    //        var user = await _accountRepository.GetByEmailAsync(email);
    //        if (user == null) return BadRequest(new { message = "Email Not Found" });

    //        var otp = GenerateOtp();

    //        // Lấy danh sách keys hiện có
    //        if (!_cache.TryGetValue("CacheKeys", out List<string>? keys))
    //        {
    //            keys = new List<string>();
    //        }

    //        // Nếu key chưa tồn tại trong danh sách, thêm vào
    //        if (!keys.Contains(email))
    //        {
    //            keys.Add(email);
    //            _cache.Set("CacheKeys", keys);
    //        }

    //        // Lưu OTP vào cache với thời gian sống 15 phút
    //        _cache.Set(email, otp, TimeSpan.FromMinutes(15));

    //        await _emailService.SendEmailAsync(email, "OTP Verification", $"Your OTP Reset Password: {otp}");

    //        return Ok(new { message = "OTP Send To Email Successfully" });
    //    }

    //    [HttpPost("verify-otp/{email}/{otp}")]
    //    public IActionResult VerifyOtp(string email, string otp)
    //    {
    //        // Kiểm tra xem cache có chứa email không
    //        if (!_cache.TryGetValue(email, out string? cachedOtp))
    //        {
    //            return BadRequest(new { message = "OTP is Invalid or Expired" });
    //        }

    //        // Kiểm tra OTP nhập vào có khớp với OTP đã lưu không
    //        if (cachedOtp != otp)
    //        {
    //            return BadRequest(new { message = "OTP is Incorrect" });
    //        }

    //        return Ok(new { message = "OTP Verified Successfully" });
    //    }

    //    [HttpPost("forgot-password")]
    //    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO model)
    //    {
    //        // Kiểm tra model có đủ thông tin không
    //        if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Otp) || string.IsNullOrEmpty(model.NewPassword))
    //        {
    //            return BadRequest(new { message = "Email, OTP, and New Password are required" });
    //        }

    //        // Kiểm tra xem cache có chứa email không
    //        if (!_cache.TryGetValue(model.Email, out string? cachedOtp))
    //        {
    //            return BadRequest(new { message = "OTP is Invalid or Expired" });
    //        }

    //        // Kiểm tra OTP nhập vào có khớp với OTP đã lưu không
    //        if (cachedOtp != model.Otp)
    //        {
    //            return BadRequest(new { message = "OTP is Incorrect" });
    //        }

    //        // OTP hợp lệ -> kiểm tra tài khoản trong DB
    //        var user = await _accountRepository.GetByEmailAsync(model.Email);
    //        if (user == null)
    //        {
    //            return BadRequest(new { message = "Email Not Found" });
    //        }

    //        // Cập nhật mật khẩu mới
    //        user.Password = _passwordService.HashPassword(model.NewPassword);
    //        await _accountRepository.UpdateAsync(user);

    //        // Xóa OTP khỏi cache để không sử dụng lại
    //        _cache.Remove(model.Email);

    //        return Ok(new { message = "Password Updated Successfully" });
    //    }

    //    private string GenerateOtp()
    //    {
    //        var random = new Random();
    //        return random.Next(100000, 999999).ToString();
    //    }

    //}
}
