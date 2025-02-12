using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace OTMS_DLA.DAO
{
    public class RoleDAO : GenericDAO<Role>
    {
        public RoleDAO(OtmsContext context) : base(context) { }

        public async Task<Guid?> GetRoleByNameAsync(string roleName)
        {
            return (await _dbSet.FirstOrDefaultAsync(a => a.Name.Equals(roleName)))?.RoleId;
        }
    }
}
