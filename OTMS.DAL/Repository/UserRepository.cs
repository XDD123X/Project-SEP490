using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly UserDAO _userDAO;
        private readonly IConfiguration _configuration;

        public UserRepository(UserDAO userDAO, IConfiguration configuration)
        {
            _userDAO = userDAO;
            _configuration = configuration;
        }

        public async Task<Account> AuthenticateUser(LoginDTO loginDTO)
        {
            Account user = await _userDAO.GetUserByEmail(loginDTO.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.Password))
            {
                return null;
            }
            return user;
        }

        public string GenerateJwtToken(Account account, bool rememberMe)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, account.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, account.Role?.Name ?? "DefaultRole"),
                new Claim("AccountId", account.AccountId.ToString())
            };

            int expiryMinutes = rememberMe ? 60 * 24 * 7 : _configuration.GetValue("Jwt:ExpiryInMinutes", 15);
            var expire = DateTime.Now.AddMinutes(expiryMinutes);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expire,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        public async Task<string> RefreshAccessToken(string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                return null;
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false
                };

                var principal = tokenHandler.ValidateToken(refreshToken, tokenValidationParameters, out SecurityToken validatedToken);

                if (validatedToken is not JwtSecurityToken jwtToken || jwtToken.Header.Alg != SecurityAlgorithms.HmacSha256)
                {
                    return null;
                }

                var email = principal.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
                if (email == null)
                {
                    return null;
                }

                var user = await _userDAO.GetUserByEmail(email);
                if (user == null)
                {
                    return null;
                }

                return GenerateJwtToken(user, false);
            }
            catch
            {
                return null;
            }
        }
    }
}
