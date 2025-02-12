using BusinessObject.DTOs;
using BusinessObject.Models;
using OTMS_DLA.DAO;
using OTMS_DLA.Interface;
using OTMSAPI.DAO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMSAPI.Repositories
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

        public Task<int> GetTotalAccountsAsync(string search, int? status, string? classCode, DateTime? date)
            => _accountDAO.GetTotalAccountsAsync(search, status, classCode, date);

        public Task AddMultipleAsync(List<Account> accounts) => _accountDAO.AddMultipleAsync(accounts);
    }
}
