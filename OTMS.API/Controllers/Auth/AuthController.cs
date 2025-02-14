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
            Account account = await _accountRepository.GetByLogin(loginDTO.Email, _passwordService.HashPassword(loginDTO.Password));
            if (account == null)
            {
                return NotFound("Invalid user credentials");
            }

            var accessToken = _tokenService.GenerateAccessToken(account);
            if (loginDTO.RememberMe == true)
            {
                var refreshToken = _tokenService.GenerateRefreshToken();
                await _refreshTokenRepository.AddAsync(refreshToken, account.AccountId);
                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
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
            }
            );

        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult> RefreshToken()
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken)) return Unauthorized();

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
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return Ok("Logged out successfully");
        }

    }
}
