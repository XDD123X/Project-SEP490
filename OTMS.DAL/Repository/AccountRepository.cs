using Microsoft.Identity.Client;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class AccountRepository : Repository<Account>, IAccountRepository
    {
        private readonly AccountDAO _accountDAO;

        public AccountRepository(AccountDAO accountDAO) : base(accountDAO)
        {
            _accountDAO = accountDAO;
        }

        public Task<Account?> GetByEmailAsync(string email) => _accountDAO.GetByEmailAsync(email);

        public Task<bool> ExistsByEmailAsync(string email) => _accountDAO.ExistsByEmailAsync(email);

        public Task<List<string>> GetAllEmailsAsync() => _accountDAO.GetAllEmailsAsync();

        public Task<int> GetTotalAccountsAsync(string? search, int? status, string? classCode, DateTime? date)
            => _accountDAO.GetTotalAccountsAsync(search, status, classCode, date);

        public Task AddMultipleAsync(List<Account> accounts) => _accountDAO.AddMultipleAsync(accounts);

        public new Task<Account?> GetByIdAsync(Guid id) => _accountDAO.GetByIdAsync(id);

        public Task<Account?> GetByLogin(string email, string password) => _accountDAO.GetByLogin(email, password);
        public Task<List<Account>> GetByStudentByClass(Guid classId) => _accountDAO.GetStudentByClass(classId);
        public Task<List<Account>> GetByStudentByClassCode(string code) => _accountDAO.GetStudentByClassCode(code);
        public new Task UpdateAsync(Account account) => _accountDAO.UpdateAsync(account);

        public Task<Role?> GetRoleByRoleName(string RoleName) => _accountDAO.GetRoleByRoleName(RoleName);

        public Task<List<Account>> getAllStudentAccount(string roleId) => _accountDAO.getAllStudentAccount(roleId);
        public async Task ImportParent(Parent parent) => await _accountDAO.ImportParent(parent);

        public Task<List<Account>> GetStudentList() => _accountDAO.GetStudentList();

        public Task<List<Account>> GetLecturerList() => _accountDAO.GetLecturerList();

        public Task<List<Account>> GetOfficerList() => _accountDAO.GetOfficerList();
        public Task<List<Account>> GetAccountListAsync() => _accountDAO.GetAccountListAsync();
        public Task<bool> AddAccount(Account account) => _accountDAO.AddAccount(account);
        public async Task<bool> DeleteAccount(Guid accountId) => await _accountDAO.DeleteAccount(accountId);

        public Task<bool> updateImageAccount(Guid accountId, string newImgUrl) => _accountDAO.updateImageAccount(accountId, newImgUrl);

        public async Task<List<Account>> GetAccountByRoleNameAsync(string roleName) => await _accountDAO.GetAccountsByRoleNameAsync(roleName);
        public async Task<List<Guid>> GetAccountsByCourseAsync(string courseName) => await _accountDAO.GetAccountsByCourseAsync(courseName);

        public async Task<List<Guid>> GetAccountsByClassAsync(string classCode) => await _accountDAO.GetAccountsByClassAsync(classCode);


    }
}
