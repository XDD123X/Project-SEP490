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
using OTMS.BLL.Services;

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
        private readonly IPasswordService _passwordService;
        private readonly IEmailService _emailService;

        public AccountController(IMapper mapper, IAccountRepository accountRepository, IRoleRepository roleRepository, IClassStudentRepository classStudentRepository, IClassRepository classRepository, IConfiguration configuration, IPasswordService passwordService, IEmailService emailService)
        {
            _mapper = mapper;
            _accountRepository = accountRepository;
            _roleRepository = roleRepository;
            _classStudentRepository = classStudentRepository;
            _classRepository = classRepository;
            _configuration = configuration;
            _passwordService = passwordService;
            _emailService = emailService;
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

        [HttpPost("add-list-officer")]
        public async Task<IActionResult> AddListLecturer([FromBody] List<AddStudentListDTO> officers)
        {
            if (officers == null || officers.Count == 0)
                return BadRequest(new { message = "Invalid Officer List!" });

            int success = 0;
            int fail = 0;
            var role = await _roleRepository.GetRoleByNameAsync("Officer");

            foreach (var o in officers)
            {
                string plainPassword = _passwordService.RandomPassword(8);
                string hashedPassword = _passwordService.HashPassword(plainPassword);

                var officer = new Account
                {
                    Email = o.Email,
                    Password = hashedPassword,
                    RoleId = role.RoleId,
                    FullName = o.FullName,
                    PhoneNumber = o.PhoneNumber,
                    Dob = o.Dob,
                    Gender = o.Gender,
                    Status = o.Status,
                    CreatedAt = DateTime.Now,
                };

                bool isAdded = await _accountRepository.AddAccount(officer);

                if (isAdded)
                {
                    success++;

                    // Nội dung email
                    string subject = "Welcome To Phong Linh Class Center";
                    string message = $@"<div style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;"">
                                    <h2 style=""color: #2D89EF;"">🎉 Chào <b>{officer.FullName}</b>,</h2>
                                    <p>Chào mừng bạn đến với <b>🌿 Phong Linh Class Center!</b></p>
                                    <p>🔑 <b>Thông tin tài khoản của bạn:</b></p>
                                    <ul>
                                    <li>📧 <b>Email:</b> {officer.Email}</li>
                                    <li>🔒 <b>Mật khẩu:</b> <span style=""color: red;"">{plainPassword}</span> (vui lòng đổi sau khi đăng nhập)</li>
                                    </ul>
                                    <p>➡️ <a href=""https://phonglinhclass.com"" style=""color: #2D89EF; text-decoration: none; font-weight: bold;"">Truy cập hệ thống tại đây</a></p>
                                    <hr style=""border: none; border-top: 1px solid #ddd; margin: 20px 0;"">
                                    <p>💙 Trân trọng,</p>
                                    <p><b>🌿 Phong Linh Class Center</b></p>
                                </div>";

                    // Thêm email vào hàng đợi
                    EmailBackgroundService.EnqueueEmail(officer.Email, subject, message);
                }
                else
                {
                    fail++;
                }
            }
            return Ok(new
            {
                message = "Added Successfully!",
                success,
                fail
            });
        }
    }
}