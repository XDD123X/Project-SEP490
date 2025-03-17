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

        public Task<List<Account>> GetAccountsAsync(int page, int pageSize, string? search, int? status, string? classCode, DateTime? date, string sortBy, string sortOrder)
            => _accountDAO.GetAccountsAsync(page, pageSize, search, status, classCode, date, sortBy, sortOrder);

        public Task<int> GetTotalAccountsAsync(string? search, int? status, string? classCode, DateTime? date)
            => _accountDAO.GetTotalAccountsAsync(search, status, classCode, date);

        public Task AddMultipleAsync(List<Account> accounts) => _accountDAO.AddMultipleAsync(accounts);

        public new Task<Account?> GetByIdAsync(Guid id) => _accountDAO.GetByIdAsync(id);

        public Task<Account> GetByLogin(string email, string password) => _accountDAO.GetByLogin(email, password);
        public Task<List<Account>> GetByStudentByClass(Guid classId) => _accountDAO.GetStudentByClass(classId);
     
        public Task UpdateAsync(Account account) => _accountDAO.UpdateAsync(account);

        public Task<List<Account>> getAllStudentAccount() =>_accountDAO.getAllStudentAccount();
        public async Task ImportParent(Parent parent) => await _accountDAO.ImportParent(parent);

        public async Task<List<Account>> GetAllLecturerAndStudentAccountAsync() => await _accountDAO.getAllStudentAndLecturerAccount();
    }
}
