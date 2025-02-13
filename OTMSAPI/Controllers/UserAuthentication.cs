using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using OTMS_DLA.Interface;
using System;
using System.Threading.Tasks;

namespace OTMSAPI.Controllers
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
                    return NotFound("Invalid user");
                }

                string token = _userRepository.GenerateJwtToken(user,loginDTO.RememberMe);



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



