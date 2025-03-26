using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class RoleDAO : GenericDAO<Role>
    {
        public RoleDAO(OtmsContext context) : base(context) { }

        public async Task<Role> GetRoleByNameAsync(string roleName)
        {
            return await _context.Roles.FirstOrDefaultAsync(a => a.Name.ToLower() == roleName.ToLower());
        }

        public async Task<List<Role>> GetAll()
        {
            return await _context.Roles.ToListAsync();
        }

        public async Task<bool> ExistsAsync(string roleName)
        {
            return await _context.Roles.AnyAsync(r => r.Name.ToLower() == roleName.ToLower());
        }
    }
}
