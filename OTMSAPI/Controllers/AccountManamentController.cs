using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using OTMS_DLA.Interface;
using DocumentFormat.OpenXml.InkML;
using AutoMapper;
using DocumentFormat.OpenXml.Spreadsheet;

namespace OTMSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountManamentController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IAccountRepository _accountRepository;
        private readonly IRoleRepository _roleRepository;

        public AccountManamentController(IRoleRepository roleRepository, IAccountRepository accountRepository, IMapper mapper)
        {
            _mapper = mapper;
            _accountRepository = accountRepository;
            _roleRepository = roleRepository;
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
        [HttpPost("import-users")]
        public async Task<IActionResult> ImportUsers(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed().RowsUsed().Skip(1);

            List<Account> newUsers = new List<Account>();
            var existingEmails = await _accountRepository.GetAllEmailsAsync();
            var successAccount = new List<UserAccountDTO>();
            var errorAccount = new List<UserAccountDTO>();

            foreach (var row in rows)
            {
                var email = row.Cell(1).GetValue<string>();
                var fullName = row.Cell(2).GetValue<string>();
                var roleName = row.Cell(3).GetValue<string>();
                var phoneNumber = row.Cell(4).GetValue<string>();

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(fullName) || string.IsNullOrEmpty(phoneNumber) || string.IsNullOrEmpty(roleName) ||
                    existingEmails.Contains(email) || newUsers.Any(u => u.Email.Equals(email)))
                {
                    errorAccount.Add(new UserAccountDTO { Email = email, FullName = fullName, PhoneNumber = phoneNumber, Role = roleName });
                    continue;
                }

                var role = await _roleRepository.GetRoleByNameAsync(roleName);
                if (role == null)
                {
                    errorAccount.Add(new UserAccountDTO { Email = email, FullName = fullName, PhoneNumber = phoneNumber, Role = roleName });
                    continue;
                }
                var pass = BCrypt.Net.BCrypt.HashPassword(GenerateRandomPassword());
                var user = new Account
                {
                    Email = email,
                    FullName = fullName,
                    Password = pass,
                    RoleId = (Guid)role,
                    Status = 1,
                    CreatedAt = DateTime.UtcNow
                };
                successAccount.Add(new UserAccountDTO { Email = email, FullName = fullName, PhoneNumber = phoneNumber, Role = roleName, Password = pass });
                newUsers.Add(user);
            }

            await _accountRepository.AddMultipleAsync(newUsers);

            var resultStream = new MemoryStream();
            using (var resultWorkbook = new XLWorkbook())
            {
                var resultWorksheet = resultWorkbook.Worksheets.Add("Imported Users");
                var errorresultWorksheet = resultWorkbook.Worksheets.Add("Error Users");

                resultWorksheet.Cell(1, 1).Value = "Email";
                resultWorksheet.Cell(1, 2).Value = "Full Name";
                resultWorksheet.Cell(1, 3).Value = "Password";
                resultWorksheet.Cell(1, 4).Value = "Phone Number";

                int rowNumber = 2;
                foreach (var user in successAccount)
                {
                    resultWorksheet.Cell(rowNumber, 1).Value = user.Email;
                    resultWorksheet.Cell(rowNumber, 2).Value = user.FullName;
                    resultWorksheet.Cell(rowNumber, 3).Value = user.Password;
                    resultWorksheet.Cell(rowNumber, 4).Value = "Imported Successfully";
                    rowNumber++;
                }

                errorresultWorksheet.Cell(1, 1).Value = "Email";
                errorresultWorksheet.Cell(1, 2).Value = "Full Name";
                errorresultWorksheet.Cell(1, 3).Value = "Phone Number";
                errorresultWorksheet.Cell(1, 4).Value = "Import Failed";

                rowNumber = 2;
                foreach (var user in errorAccount)
                {
                    errorresultWorksheet.Cell(rowNumber, 1).Value = user.Email;
                    errorresultWorksheet.Cell(rowNumber, 2).Value = user.FullName;
                    errorresultWorksheet.Cell(rowNumber, 3).Value = user.PhoneNumber;
                    errorresultWorksheet.Cell(rowNumber, 4).Value = "Import Failed";
                    rowNumber++;
                }

                resultWorkbook.SaveAs(resultStream);
            }

            resultStream.Position = 0;
            return File(resultStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ImportResult.xlsx");
        }

        private string GenerateRandomPassword()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 8);
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
            if(u == null)
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
            }if (!string.IsNullOrEmpty(userDTO.Email))
            {
                if(await _accountRepository.ExistsByEmailAsync(userDTO.Email)){
                    return BadRequest("Email has been registered");
                }
                u.Email = userDTO.Email;
            }if (!string.IsNullOrEmpty(userDTO.PhoneNumber))
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