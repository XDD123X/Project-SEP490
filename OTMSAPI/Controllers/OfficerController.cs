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
                return BadRequest("File không hợp lệ.");

            var users = new List<UserAccountDto>();
            var duplicateUsers = new List<UserAccountDto>();
            var listUser = new List<Account>();
            List<string> existingEmails = _context.Accounts.Select(x => x.Email).ToList();
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RowsUsed().Skip(1);
                foreach (var row in rows)
                {
                    var fullName = row.Cell(1).GetValue<string>();
                    var email = row.Cell(2).GetValue<string>();
                    var password = GenerateRandomPassword();
                    var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
                    var role = row.Cell(3).GetValue<string>();
                    var roleEntity = _context.Roles.FirstOrDefault(x => x.Name.Equals(role));
                    if (roleEntity == null)
                    {
                        return BadRequest($"Vai trò '{role}' không tồn tại.");
                    }
                    var role_id = roleEntity.RoleId;
                    var phone_number = row.Cell(4).GetValue<string>();
                    if (existingEmails.Contains(email))
                    {
                        duplicateUsers.Add(new UserAccountDto
                        {
                            FullName = fullName,
                            Email = email,
                            Role = role,
                            PhoneNumber = phone_number,
                        });
                    }
                    else
                    {
                        existingEmails.Add(email);
                        Account account = new Account
                        {
                            FullName = fullName,
                            Email = email,
                            RoleId = role_id,
                            Password = hashedPassword,
                            PhoneNumber = phone_number,
                            CreatedAt = DateTime.Now,
                            Status = "1"
                        };
                        users.Add(new UserAccountDto
                        {
                            FullName = fullName,
                            Email = email,
                            Role = role,
                            Password = password,
                            PhoneNumber = phone_number,
                        });
                        listUser.Add(account);
                    }
                }
            }
            if (listUser.Count > 0)
            {
                _context.Accounts.AddRange(listUser);
                await _context.SaveChangesAsync();
            }
            var fileBytes = GenerateUserExcel(users, duplicateUsers);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UserAccounts.xlsx");
        }
        private string GenerateRandomPassword()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 8);
        }
        private byte[] GenerateUserExcel(List<UserAccountDto> users, List<UserAccountDto> duplicateUsers)
        {
            using var workbook = new XLWorkbook();

            var importedSheet = workbook.Worksheets.Add("Imported Users");
            importedSheet.Cell(1, 1).Value = "Full Name";
            importedSheet.Cell(1, 2).Value = "Email";
            importedSheet.Cell(1, 3).Value = "Role";
            importedSheet.Cell(1, 4).Value = "Password";
            importedSheet.Cell(1, 5).Value = "Phone Number";

            for (int i = 0; i < users.Count; i++)
            {
                importedSheet.Cell(i + 2, 1).Value = users[i].FullName;
                importedSheet.Cell(i + 2, 2).Value = users[i].Email;
                importedSheet.Cell(i + 2, 3).Value = users[i].Role;
                importedSheet.Cell(i + 2, 4).Value = users[i].Password;
                importedSheet.Cell(i + 2, 5).Value = users[i].PhoneNumber;
            }

            var duplicateSheet = workbook.Worksheets.Add("Duplicate Users");
            duplicateSheet.Cell(1, 1).Value = "Full Name";
            duplicateSheet.Cell(1, 2).Value = "Email";
            duplicateSheet.Cell(1, 3).Value = "Role";
            duplicateSheet.Cell(1, 4).Value = "Phone Number";

            for (int i = 0; i < duplicateUsers.Count; i++)
            {
                duplicateSheet.Cell(i + 2, 1).Value = duplicateUsers[i].FullName;
                duplicateSheet.Cell(i + 2, 2).Value = duplicateUsers[i].Email;
                duplicateSheet.Cell(i + 2, 3).Value = duplicateUsers[i].Role;
                duplicateSheet.Cell(i + 2, 4).Value = duplicateUsers[i].PhoneNumber;
            }

            importedSheet.Columns().AdjustToContents();
            duplicateSheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
        [HttpGet("accounts-list")]
        public async Task<IActionResult> GetAccounts(
          [FromQuery] int page = 1,
          [FromQuery] int pageSize = 10,
          [FromQuery] string? search = null,
          [FromQuery] string? status = null,
          [FromQuery] string? classCode = null,
          [FromQuery] string? role = null,
          [FromQuery] DateTime? date = null,
          [FromQuery] string sortBy = "fullName",
          [FromQuery] string sortOrder = "desc")
        {
            IQueryable<Account> query = _context.Accounts
                .Include(a => a.Role)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(u => u.Status == status);
            }

            if (!string.IsNullOrEmpty(classCode))
            {
                query = query.Where(u => _context.ClassStudents
                    .Where(cs => _context.Classes.Any(c => c.ClassId == cs.ClassId && c.ClassCode == classCode))
                    .Select(cs => cs.StudentId)
                    .Contains(u.AccountId));
            }
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role.Name == role);
            }

            if (date.HasValue)
            {
                query = query.Where(u => u.CreatedAt == date.Value.Date);
            }

            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(u => (dynamic)GetSortExpression(sortBy))
                : query.OrderBy(u => (dynamic)GetSortExpression(sortBy));


            var totalUsers = await query.CountAsync();
            var users = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new
            {
                TotalUsers = totalUsers,
                Page = page,
                PageSize = pageSize,
                Users = users
            });
        }

        private static Expression<Func<Account, object>> GetSortExpression(string sortBy)
        {
            return sortBy.ToLower() switch
            {
                "fullname" => u => u.FullName,
                "email" => u => u.Email,
                "status" => u => u.Status,
                "role" => u => u.Role.Name,
                "date" => u => u.CreatedAt,
                _ => u => u.FullName 
            };
        }



    }
}
