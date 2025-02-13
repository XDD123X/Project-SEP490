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
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public AuthController(IAccountRepository accountRepository, IPasswordService passwordService, ITokenService tokenService)
        {
            _accountRepository = accountRepository;
            _passwordService = passwordService;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDTO loginDTO)
        {
            Account account = await _accountRepository.GetByLogin(loginDTO.Email, _passwordService.HashPassword(loginDTO.Password));
            if (account == null)
            {
                return NotFound("Invalid user credentials");
            }

            string accessToken = _tokenService.GenerateAccessToken(account);

            return Ok(new { token = accessToken });

        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult> RefreshToken()
        {


            return Ok(new { token = "" });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return Ok("Logged out successfully");
        }

    }
}
