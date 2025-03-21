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
    }
}
