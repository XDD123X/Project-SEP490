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

namespace OTMS.API.Officer
{
    [Route("api/officer/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IAccountRepository _accountRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IClassRepository _classRepository;
        private readonly IConfiguration _configuration;

        public AccountController(IMapper mapper, IAccountRepository accountRepository, IRoleRepository roleRepository, IClassStudentRepository classStudentRepository, IClassRepository classRepository, IConfiguration configuration)
        {
            _mapper = mapper;
            _accountRepository = accountRepository;
            _roleRepository = roleRepository;
            _classStudentRepository = classStudentRepository;
            _classRepository = classRepository;
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
            var failedAccounts = new List<(string Email, string Reason)>();

            foreach (var row in rows)
            {
                var email = row.Cell(1).GetValue<string>();
                var fullName = row.Cell(2).GetValue<string>();
                var roleName = row.Cell(3).GetValue<string>();
                var phoneNumber = row.Cell(4).GetValue<string>();
                var dob = row.Cell(5).GetValue<DateOnly?>();
                var fulltime = row.Cell(6).GetBoolean();
                var imgUrl = row.Cell(7).GetValue<string>();
                var status = row.Cell(8).GetValue<int>();

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(fullName) || string.IsNullOrEmpty(phoneNumber) || string.IsNullOrEmpty(roleName))
                {
                    failedAccounts.Add((email, "Missing required fields"));
                    continue;
                }
                if (existingEmails.Contains(email) || newUsers.Any(u => u.Email.Equals(email)))
                {
                    failedAccounts.Add((email, "Email already exists"));
                    continue;
                }
                if ((roleName != "Student" && roleName != "Lecturer"))
                {
                    failedAccounts.Add((email, "Invalid role"));
                    continue;
                }
                var role = await _roleRepository.GetRoleByNameAsync(roleName);
                var password = GenerateRandomPassword();
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
                var user = new Account
                {
                    Email = email,
                    FullName = fullName,
                    Password = hashedPassword,
                    RoleId = (Guid)role,
                    PhoneNumber = phoneNumber,
                    Dob = dob,
                    Fulltime = fulltime,
                    ImgUrl = imgUrl,
                    Status = status,
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

            var excelFile = GenerateResultExcel(successAccounts, failedAccounts);
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ImportResults.xlsx");
        }

        private byte[] GenerateResultExcel(List<UserAccountDTO> successAccounts, List<(string Email, string Reason)> failedAccounts)
        {
            using var workbook = new XLWorkbook();
            var successSheet = workbook.Worksheets.Add("Success");
            successSheet.Cell(1, 1).Value = "Email";
            successSheet.Cell(1, 2).Value = "Full Name";
            successSheet.Cell(1, 3).Value = "Phone Number";
            successSheet.Cell(1, 4).Value = "Role";
            successSheet.Cell(1, 5).Value = "Password";

            for (int i = 0; i < successAccounts.Count; i++)
            {
                successSheet.Cell(i + 2, 1).Value = successAccounts[i].Email;
                successSheet.Cell(i + 2, 2).Value = successAccounts[i].FullName;
                successSheet.Cell(i + 2, 3).Value = successAccounts[i].PhoneNumber;
                successSheet.Cell(i + 2, 4).Value = successAccounts[i].Role;
                successSheet.Cell(i + 2, 5).Value = successAccounts[i].Password;
            }

            var failedSheet = workbook.Worksheets.Add("Failed");
            failedSheet.Cell(1, 1).Value = "Email";
            failedSheet.Cell(1, 2).Value = "Reason";

            for (int i = 0; i < failedAccounts.Count; i++)
            {
                failedSheet.Cell(i + 2, 1).Value = failedAccounts[i].Email;
                failedSheet.Cell(i + 2, 2).Value = failedAccounts[i].Reason;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
        [HttpPost("SendEmailsFromExcel")]
        public async Task<IActionResult> SendAccountEmailsFromExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Invalid file.");
            }
            try
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RangeUsed().RowsUsed().Skip(1);

                var smtpClient = new SmtpClient(_configuration["EmailSettings:SmtpServer"])
                {
                    Port = int.Parse(_configuration["EmailSettings:SmtpPort"]),
                    Credentials = new NetworkCredential(_configuration["EmailSettings:Email"], _configuration["EmailSettings:Password"]),
                    EnableSsl = true
                };

                foreach (var row in rows)
                {
                    var email = row.Cell(1).GetValue<string>();
                    var fullName = row.Cell(2).GetValue<string>();
                    var roleName = row.Cell(3).GetValue<string>();
                    var phoneNumber = row.Cell(4).GetValue<string>();
                    var password = row.Cell(5).GetValue<string>();

                    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                    {
                        continue;
                    }

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(_configuration["EmailSettings:Email"]),
                        Subject = "Your Account Information",
                        Body = $"Hello {fullName},\n\nYour account has been created successfully.\nEmail: {email}\nPassword: {password}\n\nPlease change your password after logging in.",
                        IsBodyHtml = false
                    };
                    mailMessage.To.Add(email);

                    try
                    {
                        await smtpClient.SendMailAsync(mailMessage);
                        Console.WriteLine($"Email sent to {email}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Failed to send email to {email}: {ex.Message}");
                    }
                }

                return Ok("Emails sent successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing file: {ex.Message}");
            }
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
            var worksheet = workbook.Worksheets.Add("Account");

            worksheet.Cell(1, 1).Value = "Email";
            worksheet.Cell(1, 2).Value = "FullName";
            worksheet.Cell(1, 3).Value = "Role";
            worksheet.Cell(1, 4).Value = "Phone Number";
            worksheet.Cell(1, 5).Value = "Day of birth";
            worksheet.Cell(1, 6).Value = "Full Time";
            worksheet.Cell(1, 7).Value = "Avatar";
            worksheet.Cell(1, 8).Value = "status";

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UserTemplate.xlsx");
        }
        [HttpGet("accounts-list")]
        public async Task<IActionResult> GetAccounts()
        {
            var users = await _accountRepository.GetAllLecturerAndStudentAccountAsync();
            return Ok(users);
        }

        [HttpGet("find-account/{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found");
            if (!user.Role.Name.Equals("Student")|| !user.Role.Name.Equals("Lecturer"))
            {
                return BadRequest("Invalid permision");
            }
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
            if (!u.Role.Name.Equals("Student") || !u.Role.Name.Equals("Lecturer"))
            {
                return BadRequest("Invalid permision");
            }
            if (userDTO.Role == null)
            {
                userDTO.Role = u.Role.Name;
            }
            if ((userDTO.Role.Equals("Student") && userDTO.Role.Equals("Lecturer")))
            {
                return BadRequest("Invalid role");
            }
            var role = await _roleRepository.GetRoleByNameAsync(userDTO.Role);
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
        [Authorize(Roles = "Officer")]
        [HttpPut("ban-accounts/{id}")]
        public async Task<IActionResult> BanUser(Guid id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null) return NotFound("Account not found");
            if (!user.Role.Name.Equals("Student") || !user.Role.Name.Equals("Lecturer"))
            {
                return BadRequest("Invalid permision");
            }
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (currentUserId.Equals(id))
            {
                return BadRequest("You can't ban your account");
            }
            bool isStudentInClass = await _classStudentRepository.checkStudentAnyInClass(id);
            bool isLecturerInCourse = await _classRepository.checkLeturerInAnyClass(id);

            if (isStudentInClass || isLecturerInCourse)
            {
                return BadRequest("You cannot delete this account because it is still associated with classes.");
            }
            user.Status = 0;
            try
            {
                await _accountRepository.UpdateAsync(user);
                return Ok("Account banned");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while ban account " + id);
            }
        }
        [Authorize(Roles = "Officer")]
        [HttpPut("activate-accounts/{id}")]
        public async Task<IActionResult> ActivateUser(Guid id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null) return NotFound("Account not found");
            if (!user.Role.Name.Equals("Student") || !user.Role.Name.Equals("Lecturer"))
            {
                return BadRequest("Invalid permision");
            }
            user.Status = 1;
            try
            {
                await _accountRepository.UpdateAsync(user);
                return Ok("Account is activate");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while activate account " + id);
            }
        }
    }
}