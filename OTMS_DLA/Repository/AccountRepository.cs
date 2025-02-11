using BusinessObject.DTOs;
using BusinessObject.Models;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OTMS_DLA.Interface;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace OTMSAPI.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly OtmsContext _context;

        public AccountRepository(OtmsContext context)
        {
            _context = context;
        }

        public async Task<List<Account>> GetAccountsAsync(int page, int pageSize, string? search, int? status, string? classCode, DateTime? date, string sortBy, string sortOrder)
        {
            IQueryable<Account> query = _context.Accounts.Include(a => a.Role);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

            if (status.HasValue)
                query = query.Where(u => u.Status == status);

            if (!string.IsNullOrEmpty(classCode))
                query = query.Where(u => _context.ClassStudents
                    .Where(cs => _context.Classes.Any(c => c.ClassId == cs.ClassId && c.ClassCode == classCode))
                    .Select(cs => cs.StudentId)
                    .Contains(u.AccountId));

            if (date.HasValue)
                query = query.Where(u => u.CreatedAt == date.Value.Date);

            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(GetSortExpression(sortBy))
                : query.OrderBy(GetSortExpression(sortBy));

            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        }

        public async Task<int> GetTotalAccountsAsync(string search, int? status, string? classCode, DateTime? date)
        {
            IQueryable<Account> query = _context.Accounts;

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

            if (status.HasValue)
                query = query.Where(u => u.Status == status);

            if (date.HasValue)
                query = query.Where(u => u.CreatedAt == date.Value.Date);

            return await query.CountAsync();
        }

        public async Task<Account?> GetByIdAsync(int id)
        {
            return await _context.Accounts.FindAsync(id);
        }

        public async Task<Account> CreateAccountAsync(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<bool> UpdateAccountAsync(Account account)
        {
            _context.Accounts.Update(account);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> BanAccountAsync(int id)
        {
            var user = await _context.Accounts.FindAsync(id);
            if (user == null) return false;

            user.Status = 0;
            user.UpdatedAt = DateTime.Now;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ActivateAccountAsync(int id)
        {
            var user = await _context.Accounts.FindAsync(id);
            if (user == null) return false;

            user.Status = 1;
            user.UpdatedAt = DateTime.Now;
            return await _context.SaveChangesAsync() > 0;
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
        public async Task<byte[]> ImportUsersAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed().RowsUsed().Skip(1);

            List<Account> newUsers = new List<Account>();

            var existingEmails = await _context.Accounts.Select(a => a.Email).ToHashSetAsync();
            var errorAccount = new List<UserAccountDto>();
            foreach (var row in rows)
            {
                var email = row.Cell(1).GetValue<string>();
                var fullName = row.Cell(2).GetValue<string>();
                var phoneNumber = row.Cell(3).GetValue<string>();
                var roleName = row.Cell(4).GetValue<string>();

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(fullName) || string.IsNullOrEmpty(phoneNumber) || string.IsNullOrEmpty(roleName))
                {
                    errorAccount.Add(new UserAccountDto
                    {
                        Email = email,
                        FullName = fullName,
                        PhoneNumber = phoneNumber,
                        Role = roleName
                    });
                    continue;
                }
                   
                if (existingEmails.Contains(email) || newUsers.Any(u => u.Email.Equals(email)))
                {
                    errorAccount.Add(new UserAccountDto
                    {
                        Email = email,
                        FullName = fullName,
                        PhoneNumber = phoneNumber,
                        Role = roleName
                    });
                    continue;
                }

                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
                if (role == null)
                {
                    errorAccount.Add(new UserAccountDto
                    {
                        Email = email,
                        FullName = fullName,
                        PhoneNumber = phoneNumber,
                        Role = roleName
                    });
                    continue;
                }

                var user = new Account
                {
                    Email = email,
                    FullName = fullName,
                    Password = BCrypt.Net.BCrypt.HashPassword(GenerateRandomPassword()),
                    RoleId = role.RoleId,
                    Status = 1,
                    CreatedAt = DateTime.UtcNow
                };

                newUsers.Add(user);
            }

            _context.Accounts.AddRange(newUsers);
            await _context.SaveChangesAsync();

            using var resultStream = new MemoryStream();
            using var resultWorkbook = new XLWorkbook();
            var resultWorksheet = resultWorkbook.Worksheets.Add("Imported Users");
            var errorresultWorksheet = resultWorkbook.Worksheets.Add("Error Users");
            resultWorksheet.Cell(1, 1).Value = "Email";
            resultWorksheet.Cell(1, 2).Value = "Full Name";
            resultWorksheet.Cell(1, 3).Value = "Password";
            resultWorksheet.Cell(1, 4).Value = "Phone Number";

            int rowNumber = 2;
            foreach (var user in newUsers)
            {
                resultWorksheet.Cell(rowNumber, 1).Value = user.Email;
                resultWorksheet.Cell(rowNumber, 2).Value = user.FullName;
                resultWorksheet.Cell(rowNumber, 3).Value = user.Password;
                resultWorksheet.Cell(rowNumber, 4).Value = user.PhoneNumber;
                resultWorksheet.Cell(rowNumber, 5).Value = "Imported Successfully";
                rowNumber++;
            }
            errorresultWorksheet.Cell(1, 1).Value = "Email";
            errorresultWorksheet.Cell(1, 2).Value = "Full Name";

            rowNumber = 2;
            foreach (var user in errorAccount)
            {
                errorresultWorksheet.Cell(rowNumber, 1).Value = user.Email;
                errorresultWorksheet.Cell(rowNumber, 2).Value = user.FullName;
                errorresultWorksheet.Cell(rowNumber, 3).Value = user.PhoneNumber;
                errorresultWorksheet.Cell(rowNumber, 4).Value = "Imported Successfully";
                rowNumber++;
            }
            resultWorkbook.SaveAs(resultStream);
            return resultStream.ToArray();
        }
        private string GenerateRandomPassword()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 8);
        }
    }
}
