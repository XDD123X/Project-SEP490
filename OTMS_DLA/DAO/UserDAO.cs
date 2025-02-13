using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace OTMS_DLA.DAO
{
    public class UserDAO
    {
        private readonly OtmsContext _context;

        public UserDAO(OtmsContext context)
        {
            _context = context;
        }

        public async Task<Account> GetUserByEmail(string email)
        {
            return await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Email == email);
        }
    }
}
