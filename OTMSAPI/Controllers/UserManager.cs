using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Threading.Tasks;

namespace OTMSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserManager : ControllerBase
    {
        private readonly OtmsContext _context;
        private readonly IConfiguration _configuration;

        public UserManager(OtmsContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [Authorize]

        [HttpPut("changeprofile")]
        public async Task<ActionResult> ChangeProfile([FromBody] UserUpdateProfile userUpdateProfile)
        {
            string userId = User.FindFirst("userId")?.Value;

            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out Guid userGuid))
            {
                return Unauthorized("Invalid or missing user ID.");
            }

            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserId == userGuid);

                if (user == null)
                {
                    return NotFound("User not found.");
                }

                user.Email = userUpdateProfile.Email;
                user.FullName = userUpdateProfile.FullName;
                user.UpdatedAt = DateTime.UtcNow;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok("Profile updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating profile.");
            }
        }


        [HttpPost("forgotpassword")]
        public async Task<ActionResult> ForgotPassword([FromBody] string email)
        {
            User user = _context.Users.FirstOrDefault(x => x.Email == email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var resetToken = Guid.NewGuid().ToString();

            user.Token = resetToken;
            //user.ResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

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
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while sending email.");
            }

            return Ok("Password reset link has been sent to your email.");
        }

        [HttpPost("resetpassword")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequestDTO resetRequest)
        {
            var user = _context.Users.FirstOrDefault(x => x.Token == resetRequest.Code);

            if (user == null /*|| user.ResetTokenExpiresAt < DateTime.UtcNow*/)
            {
                return Unauthorized("Invalid or expired reset token.");
            }

            user.Password = resetRequest.NewPassword; 
            user.Token = null;
           // user.ResetTokenExpiresAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Password has been reset successfully.");
        }





    }
}
