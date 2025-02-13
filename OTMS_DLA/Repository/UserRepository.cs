using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OTMS_DLA.DAO;
using OTMS_DLA.Interface;



namespace OTMS_DLA.Repository
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

        //public string GenerateJwtToken(Account account)
        //{
        //    var claims = new[]
        //    {
        //        new Claim(JwtRegisteredClaimNames.Sub, account.Email),
        //        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        //        new Claim(ClaimTypes.Role, account.Role?.Name ?? "DefaultRole"),
        //        new Claim("AccountId", account.AccountId.ToString())
        //    };

        //    var expire = DateTime.Now.AddDays(_configuration.GetValue<int>("Jwt:ExpiryInDays"));

        //    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        //    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        //    var token = new JwtSecurityToken(
        //        issuer: _configuration["Jwt:Issuer"],
        //        audience: _configuration["Jwt:Audience"],
        //        claims: claims,
        //        expires: expire,
        //        signingCredentials: creds
        //    );

        //    return new JwtSecurityTokenHandler().WriteToken(token);
        //}


        public string GenerateJwtToken(Account account, bool rememberMe)
        {
            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, account.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.Role, account.Role?.Name ?? "DefaultRole"),
        new Claim("AccountId", account.AccountId.ToString())
    };

            int expiryDays = rememberMe ? 30 : _configuration.GetValue<int>("Jwt:ExpiryInDays", 1);
            var expire = DateTime.Now.AddDays(expiryDays);

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


    }
}
