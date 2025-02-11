using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using OTMS_DLA.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Repository
{
    public class RoleRepository : Repository<Role>, IRoleRepository
    {
        public RoleRepository(OtmsContext context) : base(context) { }

        public async Task<Guid?> GetRoleByNameAsync(string roleName)
        {
            return (await _dbSet.FirstOrDefaultAsync(a => a.Name.Equals(roleName)))?.RoleId;
        }
    }
}
