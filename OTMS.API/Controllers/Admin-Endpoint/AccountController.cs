using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using AutoMapper;
using ClosedXML.Excel;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.DAO;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Security.Claims;

namespace OTMS.API.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IAccountRepository _accountRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IClassRepository _classRepository;
        private readonly IConfiguration _configuration;

        public AccountController(IMapper mapper, IAccountRepository accountRepository, IRoleRepository roleRepository, IClassStudentRepository classStudentRepository, IConfiguration configuration, IClassRepository classRepository)
        {
            _mapper = mapper;
            _accountRepository = accountRepository;
            _roleRepository = roleRepository;
            _classStudentRepository = classStudentRepository;
            _classRepository = classRepository;
            _configuration = configuration;
        }

        [HttpGet("accounts-list")]
        public async Task<IActionResult> GetAccounts()
        {
            var users = await _accountRepository.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("find-account/{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found");
            UserAccountDTO u = _mapper.Map<UserAccountDTO>(user);
            return Ok(u);
        }
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditUser(Guid id, UserAccountDTO userDTO)
        {
            var u = await _accountRepository.GetByIdAsync(id);
            if (u == null)
            {
                return NotFound();
            }
            if (userDTO.Role == null)
            {
                userDTO.Role = u.Role.Name;
            }
            var role = await _roleRepository.GetRoleByNameAsync(userDTO.Role);
            if (role == null)
            {
                return BadRequest("Invalid role");
            }
            if (!string.IsNullOrEmpty(userDTO.FullName))
            {
                u.FullName = userDTO.FullName;
            }
            if (!string.IsNullOrEmpty(userDTO.Email))
            {
                if (await _accountRepository.ExistsByEmailAsync(userDTO.Email))
                {
                    return BadRequest("Email has been registered");
                }
                u.Email = userDTO.Email;
            }
            if (!string.IsNullOrEmpty(userDTO.PhoneNumber))
            {
                u.PhoneNumber = userDTO.PhoneNumber;
            }
            try
            {
                await _accountRepository.UpdateAsync(u);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while edit account " + id);
            }
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            try
            {
                await _accountRepository.DeleteAccount(id);
                return Ok("Account deleted successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the account.");
            }
        }


    }
}