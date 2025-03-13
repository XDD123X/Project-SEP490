//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Identity.Data;
//using Microsoft.AspNetCore.Mvc;
//using System;
//using System.Linq;
//using System.Net.Mail;
//using System.Net;
//using System.Threading.Tasks;
//using Microsoft.Extensions.Caching.Memory;
//using DocumentFormat.OpenXml.Office.Word;
//using OTMS.BLL.Models;
//using OTMS.BLL.DTOs;
////using OTMSAPI.SolveSchedule;

//namespace OTMS.API.Controllers.Auth
//{
//    [Route("api/user/[controller]")]
//    [ApiController]
//    public class AccountController : ControllerBase
//    {
//        private readonly OtmsContext _context;
//        private readonly IConfiguration _configuration;
//        private readonly IMemoryCache memoryCache;
//        private readonly TimeSpan tokenExpiry = TimeSpan.FromMinutes(15);
//        public AccountController(OtmsContext context, IConfiguration configuration, IMemoryCache memoryCache)
//        {
//            _context = context;
//            _configuration = configuration;
//            this.memoryCache = memoryCache;
//        }

//        [Authorize]

//        [HttpPut("changeprofile")]
//        public async Task<ActionResult> ChangeProfile([FromBody] UserUpdateProfile userUpdateProfile)
//        {
//            string AccountId = User.FindFirst("AccountId")?.Value;



//            try
//            {
//                Account account = _context.Accounts.FirstOrDefault(x => x.AccountId == Guid.Parse(AccountId));

//                if (account == null)
//                {
//                    return NotFound("User not found.");
//                }

//                account.Email = userUpdateProfile.Email;
//                account.FullName = userUpdateProfile.FullName;
//                account.UpdatedAt = DateTime.UtcNow;

//                _context.Accounts.Update(account);
//                await _context.SaveChangesAsync();

//                return Ok("Profile updated successfully.");
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating profile.");
//            }
//        }

//        [NonAction]

//        public string GenerateResetToken(string email)
//        {
//            string token = Guid.NewGuid().ToString();
//            memoryCache.Set(token, email, tokenExpiry);
//            return token;
//        }

//        [NonAction]

//        public string? ValidateResetToken(string token)
//        {
//            if (memoryCache.TryGetValue(token, out string? email))
//            {
//                memoryCache.Remove(token);
//                return email;
//            }
//            return null;
//        }



//        [HttpPost("forgotpassword")]
//        public async Task<ActionResult> ForgotPassword([FromBody] string email)
//        {
//            Account user = _context.Accounts.FirstOrDefault(x => x.Email == email);

//            if (user == null)
//            {
//                return NotFound("User not found.");
//            }

//            var resetToken = GenerateResetToken(email);



//            var resetLink = $"{_configuration["AppSettings:ClientBaseUrl"]}/resetpassword?token={resetToken}";

//            try
//            {
//                var smtpClient = new SmtpClient(_configuration["EmailSettings:SmtpServer"])
//                {
//                    Port = int.Parse(_configuration["EmailSettings:SmtpPort"]),
//                    Credentials = new NetworkCredential(_configuration["EmailSettings:Email"], _configuration["EmailSettings:Password"]),
//                    EnableSsl = true
//                };

//                var mailMessage = new MailMessage
//                {
//                    From = new MailAddress(_configuration["EmailSettings:Email"]),
//                    Subject = "Password Reset Request",
//                    Body = $"Click the following link to reset your password: {resetLink}",
//                    IsBodyHtml = true,
//                };

//                mailMessage.To.Add(user.Email);
//                await smtpClient.SendMailAsync(mailMessage);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while sending email.");
//            }

//            return Ok("Password reset link has been sent to your email.");
//        }

//        [HttpPost("resetpassword")]
//        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequestDTO resetRequest)
//        {
//            string? email = ValidateResetToken(resetRequest.Token);
//            if (email == null || email != resetRequest.Email)
//            {
//                return Unauthorized("Invalid or expired reset token.");
//            }

//            Account account = _context.Accounts.FirstOrDefault(x => x.Email == resetRequest.Email);
//            if (account == null)
//            {
//                return NotFound("User not found.");
//            }

//            account.Password = BCrypt.Net.BCrypt.HashPassword(resetRequest.NewPassword);
//            account.UpdatedAt = DateTime.UtcNow;

//            _context.Accounts.Update(account);
//            await _context.SaveChangesAsync();

//            return Ok("Password has been reset successfully.");
//        }

//        [Authorize]
//        [HttpPost("changepassword")]
//        public async Task<ActionResult> changePassword(ChangePasswordDTO changePasswordDTO)
//        {
//            string AccountId = User.FindFirst("AccountId")?.Value;

//            if (AccountId == null)
//            {
//                return NotFound("No user is found");
//            }
//            else
//            {
//                Account account = _context.Accounts.FirstOrDefault(x => x.AccountId == Guid.Parse(AccountId));

//                if (account == null || !BCrypt.Net.BCrypt.Verify(changePasswordDTO.oldPassword, account.Password))
//                {
//                    return Unauthorized("Invalid account ID or password.");
//                }
//                else
//                {
//                    account.Password = BCrypt.Net.BCrypt.HashPassword(changePasswordDTO.newPassword);
//                    account.UpdatedAt = DateTime.UtcNow;

//                    _context.Accounts.Update(account);
//                    await _context.SaveChangesAsync();

//                    return Ok("Password has been changed successfully.");
//                }

//            }
//        }




//    }
//}


// AccountController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Net.Mail;
using System.Net;
using System.Threading.Tasks;

namespace OTMS.API.Controllers.Auth
{
    [Route("api/user/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _memoryCache;
        private readonly TimeSpan _tokenExpiry = TimeSpan.FromMinutes(15);

        public AccountController(IAccountRepository accountRepository, IConfiguration configuration, IMemoryCache memoryCache)
        {
            _accountRepository = accountRepository;
            _configuration = configuration;
            _memoryCache = memoryCache;
        }

        [Authorize]
        [HttpPut("changeprofile")]
        public async Task<ActionResult> ChangeProfile([FromBody] UserUpdateProfile userUpdateProfile)
        {
            string accountId = User.FindFirst("AccountId")?.Value;
            if (accountId == null)
            {
                return NotFound("User not found.");
            }

            var account = await _accountRepository.GetByIdAsync(Guid.Parse(accountId));
            if (account == null)
            {
                return NotFound("User not found.");
            }

            account.Email = userUpdateProfile.Email;
            account.FullName = userUpdateProfile.FullName;
            account.UpdatedAt = DateTime.UtcNow;

            await _accountRepository.UpdateAsync(account);
            return Ok("Profile updated successfully.");
        }

        [NonAction]
        public string GenerateResetToken(string email)
        {
            string token = Guid.NewGuid().ToString();
            _memoryCache.Set(token, email, _tokenExpiry);
            return token;
        }

        [NonAction]
        public string? ValidateResetToken(string token)
        {
            if (_memoryCache.TryGetValue(token, out string? email))
            {
                _memoryCache.Remove(token);
                return email;
            }
            return null;
        }

        [HttpPost("forgotpassword")]
        public async Task<ActionResult> ForgotPassword([FromBody] string email)
        {
            var user = await _accountRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var resetToken = GenerateResetToken(email);
            var resetLink = $"{_configuration["AppSettings:ClientBaseUrl"]}/resetpassword?token={resetToken}";

            try
            {
                var smtpClient = new SmtpClient(_configuration["EmailSettings:SmtpServer"])
                {
                    Port = int.Parse(_configuration["EmailSettings:SmtpPort"]),
                    Credentials = new NetworkCredential(_configuration["EmailSettings:Email"], _configuration["EmailSettings:Password"]),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_configuration["EmailSettings:Email"]),
                    Subject = "Password Reset Request",
                    Body = $"Click the following link to reset your password: {resetLink}",
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(user.Email);
                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while sending email.");
            }

            return Ok("Password reset link has been sent to your email.");
        }

        [HttpPost("resetpassword")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequestDTO resetRequest)
        {
            string? email = ValidateResetToken(resetRequest.Token);
            if (email == null || email != resetRequest.Email)
            {
                return Unauthorized("Invalid or expired reset token.");
            }

            var account = await _accountRepository.GetByEmailAsync(resetRequest.Email);
            if (account == null)
            {
                return NotFound("User not found.");
            }

            account.Password = BCrypt.Net.BCrypt.HashPassword(resetRequest.NewPassword);
            account.UpdatedAt = DateTime.UtcNow;

            await _accountRepository.UpdateAsync(account);
            return Ok("Password has been reset successfully.");
        }

    }
}
