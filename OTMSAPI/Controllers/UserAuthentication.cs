using BusinessObject.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using BusinessObject.DTOs;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace OTMSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAuthentication : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly OtmsContext _context;

        public UserAuthentication(IConfiguration configuration, OtmsContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        private JwtSecurityToken GetToken(Account account)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, account.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, account.Role?.Name ?? "DefaultRole"),
                new Claim("AccountId", account.AccountId.ToString())
            };

            var expire = DateTime.Now.AddDays(_configuration.GetValue<int>("Jwt:ExpiryInDays"));
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            return new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expire,
                signingCredentials: creds
            );
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDTO loginDTO)
        {
            try
            {
                Account validUser = await _context.Accounts
                    .Include(x => x.Role)
                    .FirstOrDefaultAsync(x => x.Email == loginDTO.Email);

                if (validUser == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, validUser.Password))
                {
                    return NotFound("Invalid user");
                }

                var jwtHandler = new JwtSecurityTokenHandler();
                string token = jwtHandler.WriteToken(GetToken(validUser));
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
