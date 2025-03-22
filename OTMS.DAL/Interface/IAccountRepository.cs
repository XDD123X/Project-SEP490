﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using OTMS.BLL.Models;

namespace OTMS.DAL.Interface
{
    public interface IAccountRepository : IRepository<Account>
    {
        new Task<Account?> GetByIdAsync(Guid id);
        Task<Account?> GetByEmailAsync(string email);
        Task<bool> ExistsByEmailAsync(string email);
        Task<List<string>> GetAllEmailsAsync();
        Task AddMultipleAsync(List<Account> accounts);

        Task<Account?> GetByLogin(string email, string password);
        public Task<List<Account>> GetByStudentByClass(Guid classId);


        public new Task UpdateAsync(Account account);



        public Task<Role?> GetRoleByRoleName(string RoleName);
        public Task<List<Account>> getAllStudentAccount(string roleId);
        public Task ImportParent(Parent parent);

        public Task<List<Account>> GetStudentList();
        public Task<List<Account>> GetLecturerList();
        public Task<List<Account>> GetOfficerList();
        public Task<List<Account>> GetAccountListAsync();
        public Task<bool> AddAccount(Account account);

    }
}
