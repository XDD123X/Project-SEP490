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

namespace OTMS.API.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IAccountRepository _accountRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IConfiguration _configuration;

        public AccountController(IMapper mapper, IAccountRepository accountRepository, IRoleRepository roleRepository, IConfiguration configuration)
        {
            _mapper = mapper;
            _accountRepository = accountRepository;
            _roleRepository = roleRepository;
            _configuration = configuration;
        }

        [HttpPost("import-users")]
        public async Task<IActionResult> ImportUsers(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed().RowsUsed().Skip(1);

            List<Account> newUsers = new List<Account>();
            var existingEmails = await _accountRepository.GetAllEmailsAsync();
            var successAccounts = new List<UserAccountDTO>();

            foreach (var row in rows)
            {
                var email = row.Cell(1).GetValue<string>();
                var fullName = row.Cell(2).GetValue<string>();
                var roleName = row.Cell(3).GetValue<string>();
                var phoneNumber = row.Cell(4).GetValue<string>();

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(fullName) || string.IsNullOrEmpty(phoneNumber) || string.IsNullOrEmpty(roleName) ||
                    existingEmails.Contains(email) || newUsers.Any(u => u.Email.Equals(email)))
                {
                    continue;
                }

                var role = await _roleRepository.GetRoleByNameAsync(roleName);
                if (role == null)
                {
                    continue;
                }

                var password = GenerateRandomPassword();
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
                var user = new Account
                {
                    Email = email,
                    FullName = fullName,
                    Password = hashedPassword,
                    RoleId = (Guid)role,
                    Status = 1,
                    CreatedAt = DateTime.UtcNow
                };
                successAccounts.Add(new UserAccountDTO { Email = email, FullName = fullName, PhoneNumber = phoneNumber, Role = roleName, Password = password });
                newUsers.Add(user);
            }

            await _accountRepository.AddMultipleAsync(newUsers);
            foreach (var account in successAccounts)
            {
                await SendAccountEmail(account.Email, account.FullName, account.Password);
            }

            return Ok(new { Success = successAccounts.Count, Message = "Users imported successfully." });
        }

        private async Task SendAccountEmail(string email, string fullName, string password)
        {
            try
            {
                var smtpClient = new SmtpClient(_configuration["EmailSettings:SmtpServer"])
                {
                    Port = int.Parse(_configuration["EmailSettings:SmtpPort"]),
                    Credentials = new NetworkCredential(_configuration["EmailSettings:Email"], _configuration["EmailSettings:Password"]),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_configuration["EmailSettings:Email"]),
                    Subject = "Your Account Information",
                    Body = $"Hello {fullName},\n\nYour account has been created successfully.\nEmail: {email}\nPassword: {password}\n\nPlease change your password after logging in.",
                    IsBodyHtml = false
                };
                mailMessage.To.Add(email);

                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email to {email}: {ex.Message}");
            }
        }

        private string GenerateRandomPassword()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 8);
        }
        [HttpGet("export-template")]
        public IActionResult ExportUserTemplate()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Users");

            worksheet.Cell(1, 1).Value = "Full Name";
            worksheet.Cell(1, 2).Value = "Email";
            worksheet.Cell(1, 3).Value = "Role";
            worksheet.Cell(1, 4).Value = "Phone Number";

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UserTemplate.xlsx");
        }
        [HttpGet("accounts-list")]
        public async Task<IActionResult> GetAccounts(
           [FromQuery] int page = 1,
           [FromQuery] int pageSize = 10,
           [FromQuery] string? search = null,
           [FromQuery] int? status = null,
           [FromQuery] string? classCode = null,
           [FromQuery] string? role = null,
           [FromQuery] DateTime? date = null,
           [FromQuery] string sortBy = "fullName",
           [FromQuery] string sortOrder = "desc")
        {
            var users = await _accountRepository.GetAccountsAsync(page, pageSize, search, status, classCode, date, sortBy, sortOrder);
            var totalUsers = await _accountRepository.GetTotalAccountsAsync(search, status, classCode, date);
            List<UserAccountDTO> accounts = _mapper.Map<List<UserAccountDTO>>(users);
            return Ok(new
            {
                TotalUsers = totalUsers,
                Page = page,
                PageSize = pageSize,
                Users = accounts
            });
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
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while edit account " + id);
            }
        }
        [HttpPut("ban-accounts/{id}")]
        public async Task<IActionResult> BanUser(Guid id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found");
            user.Status = 0;
            try
            {
                await _accountRepository.UpdateAsync(user);
                return Ok("User banned");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while ban account " + id);
            }
        }

        [HttpPut("activate-accounts/{id}")]
        public async Task<IActionResult> ActivateUser(Guid id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found");
            user.Status = 1;
            try
            {
                await _accountRepository.UpdateAsync(user);
                return Ok("User is activate");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while activate account " + id);
            }
        }
    }
}