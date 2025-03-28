using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using OTMS.BLL.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace OTMS.BLL.Services
{
    public class TokenService : ITokenService
    {
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public TokenService(IConfiguration configuration)
        {
            _jwtKey = configuration["Jwt:Key"]!;
            _jwtIssuer = configuration["Jwt:Issuer"]!;
            _jwtAudience = configuration["Jwt:Audience"]!;
        }

        public string GenerateAccessToken(Account account)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var credentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("uid", account.AccountId.ToString()), // account ID
                new Claim("ue", account.Email), // email
                new Claim("ur", account.Role.Name.ToLower()) // role
            };

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }



        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            var refreshToken = Convert.ToBase64String(randomNumber);
            return refreshToken;
        }
        public Guid? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                // Giải mã token
                var key = Encoding.UTF8.GetBytes(_jwtKey);
                var validationParameters = new TokenValidationParameters
                {
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidAudience = _jwtAudience,
                    ValidIssuer = _jwtIssuer,
                    ValidateIssuer = true,
                    ValidateAudience = true
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

                // Lấy AccountId từ claim
                var accountIdClaim = principal.FindFirst("uid");

                Console.WriteLine("user id from token: ", accountIdClaim);

                if (accountIdClaim == null)
                {
                    return null;
                }

                return Guid.Parse(accountIdClaim.Value);
            }
            catch
            {
                return null;
            }
        }
    }
}
