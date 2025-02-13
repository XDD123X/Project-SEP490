using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Threading.Tasks;

namespace OTMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAuthentication : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserAuthentication(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDTO loginDTO)
        {
            try
            {
                Account user = await _userRepository.AuthenticateUser(loginDTO);
                if (user == null)
                {
                    return NotFound("Invalid user credentials");
                }

                string accessToken = _userRepository.GenerateJwtToken(user, loginDTO.RememberMe);
                string refreshToken = _userRepository.GenerateRefreshToken();

                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(7)
                });

                return Ok(new { token = accessToken });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult> RefreshToken()
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out string refreshToken))
            {
                return Unauthorized("No refresh token found");
            }

            string newAccessToken = await _userRepository.RefreshAccessToken(refreshToken);
            if (string.IsNullOrEmpty(newAccessToken))
            {
                return Unauthorized("Invalid refresh token");
            }

            string newRefreshToken = _userRepository.GenerateRefreshToken();
            Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new { token = newAccessToken });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return Ok("Logged out successfully");
        }
    }
}
