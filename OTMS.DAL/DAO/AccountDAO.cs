﻿using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class AccountDAO : GenericDAO<Account>
    {
        public AccountDAO(OtmsContext context) : base(context) { }
        public new async Task<Account?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.AccountId == id);
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _context.Accounts
                .Where(a => a.Email == email).
                Include(a => a.Role)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Accounts.AnyAsync(a => a.Email == email);
        }

        public async Task<List<string>> GetAllEmailsAsync()
        {
            return await _context.Accounts.Select(a => a.Email).ToListAsync();
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

        public async Task<int> GetTotalAccountsAsync(string? search, int? status, string? classCode, DateTime? date)
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

        public async Task AddMultipleAsync(List<Account> accounts)
        {
            if (accounts == null || !accounts.Any()) return;

            await _dbSet.AddRangeAsync(accounts);
            await _context.SaveChangesAsync();
        }

        public async Task<Account> GetByLogin(string email, string password)
        {
            var account = await _context.Accounts
                .Where(a => a.Email == email && a.Password == password)
                .Include(a => a.Role)
                .FirstOrDefaultAsync();
            return account;
        }

        public async Task<List<Account>> GetStudentByClass(Guid classId)
        {
            var accounts = await _context.Accounts
                .Where(a => a.ClassStudents
                .Any(cs => cs.ClassId == classId))
                .ToListAsync();
            return accounts;
        }


        public async Task UpdateAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }


        //

        public async Task<List<Account>> getAllStudentAccount()
        {
            List<Account> accounts = await _context.Accounts
                .Where(a => a.RoleId == new Guid("0CC0C4B7-F3A5-47DC-B247-A0CCAB05E757"))
                .ToListAsync();
            return accounts;
        }


        public async Task ImportParent(Parent parent)
        {
            try
            {
                using (OtmsContext context = new OtmsContext()) 
                {
                    Parent existingParent = await context.Parents.FindAsync(parent.StudentId);

                    if (existingParent == null)
                    {
                        await context.Parents.AddAsync(parent);
                    }
                    else
                    {
                        context.Parents.Update(parent);
                    }

                    await context.SaveChangesAsync(); 
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error importing parent: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Account>> GetStudentList()
        {
            try
            {
                var role = await _context.Roles.Where(r => r.Name == "Student").FirstOrDefaultAsync();
                var students = await _context.Accounts.Where(a => a.RoleId == role.RoleId).ToListAsync();
                if (students == null) return null;
                return students;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Account>> GetLecturerList()
        {
            try
            {
                var role = await _context.Roles.Where(r => r.Name == "Lecturer").FirstOrDefaultAsync();
                var lecturers = await _context.Accounts.Where(a => a.RoleId == role.RoleId).ToListAsync();
                if (lecturers == null) return null;
                return lecturers;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Account>> GetOfficerList()
        {
            try
            {
                var role = await _context.Roles.Where(r => r.Name == "Officer").FirstOrDefaultAsync();
                var officers = await _context.Accounts.Where(a => a.RoleId == role.RoleId).ToListAsync();
                if (officers == null) return null;
                return officers;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }


    }
}
