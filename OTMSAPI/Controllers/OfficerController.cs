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

namespace OTMSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfficerController : ControllerBase
    {
        private readonly OtmsContext _context;

        public OfficerController(OtmsContext context)
        {
            _context = context;
        }
        [HttpGet("export-template")]
        public IActionResult ExportUserTemplate()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Users");

            worksheet.Cell(1, 1).Value = "Full Name";
            worksheet.Cell(1, 2).Value = "Email";
            worksheet.Cell(1, 3).Value = "Role";
            worksheet.Cell(1, 4).Value = "User Types";

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
                return BadRequest("File không hợp lệ.");

            var users = new List<UserAccountDto>();
            var duplicateUsers = new List<UserAccountDto>();
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RowsUsed().Skip(1);
                List<string> existingEmails = _context.Users.Select(x => x.Email).ToList();
                foreach (var row in rows)
                {
                    var fullName = row.Cell(1).GetValue<string>();
                    var email = row.Cell(2).GetValue<string>();
                    var password = GenerateRandomPassword();
                    var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
                    var role = row.Cell(3).GetValue<string>();
                    var role_id = _context.Roles.FirstOrDefault(x => x.RoleName.Equals(role)).RoleId;
                    var user_types = row.Cell(4).GetValue<string>();
                    var user_types_id = _context.UserTypes.FirstOrDefault(x => x.UserTypeName.Equals(user_types)).UserTypeId;
                    
                    if (existingEmails.Contains(email))
                    {
                        duplicateUsers.Add(new UserAccountDto
                        {
                            FullName = fullName,
                            Email = email,
                            Role = role,
                            Password = password,
                            Type = user_types,
                        });
                    }
                    else
                    {
                        existingEmails.Add(email);
                        User user = new User
                        {
                            UserId = GenerateUserId(),
                            FullName = fullName,
                            Email = email,
                            RoleId = role_id,
                            UserTypeId = user_types_id,
                            Password = hashedPassword,
                            CreatedAt = DateTime.Now,
                            IsActive = 1,
                            Status = "activated"
                        };
                        _context.Users.Add(user);
                        await _context.SaveChangesAsync();
                        users.Add(new UserAccountDto
                        {
                            FullName = fullName,
                            Email = email,
                            Role = role,
                            Password = password,
                            Type = user_types,
                        });
                    }

                }
            }
            var fileBytes = GenerateUserExcel(users, duplicateUsers);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UserAccounts.xlsx");
        }

        private Guid GenerateUserId()
        {
            return Guid.NewGuid();
        }

        private string GenerateRandomPassword()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 8);
        }
        [HttpGet("export-data")]
        private byte[] GenerateUserExcel(List<UserAccountDto> users, List<UserAccountDto> duplicateUsers)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("User Accounts");

            worksheet.Cell(1, 1).Value = "Full Name";
            worksheet.Cell(1, 2).Value = "Email";
            worksheet.Cell(1, 3).Value = "Role";
            worksheet.Cell(1, 4).Value = "Password";
            worksheet.Cell(1, 5).Value = "User Types";

            worksheet.Cell(1, 7).Value = "Can't import student because Email already register in system";
            worksheet.Cell(1, 8).Value = "Full Name";
            worksheet.Cell(1, 9).Value = "Email";
            worksheet.Cell(1, 10).Value = "Role";
            worksheet.Cell(1, 11).Value = "Password";
            worksheet.Cell(1, 12).Value = "User Types";

            for (int i = 0; i < users.Count; i++)
            {
                worksheet.Cell(i + 2, 1).Value = users[i].FullName;
                worksheet.Cell(i + 2, 2).Value = users[i].Email;
                worksheet.Cell(i + 2, 3).Value = users[i].Role;
                worksheet.Cell(i + 2, 4).Value = users[i].Password;
            }
            for (int i = 0; i< duplicateUsers.Count; i++)
            {
                worksheet.Cell(i + 2, 8).Value = users[i].FullName;
                worksheet.Cell(i + 2, 9).Value = users[i].Email;
                worksheet.Cell(i + 2, 10).Value = users[i].Role;
                worksheet.Cell(i + 2, 11).Value = users[i].Password;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

    }
}
