using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class RoleRepository : Repository<Role>, IRoleRepository
    {
        private readonly RoleDAO _roleDAO;

        public RoleRepository(RoleDAO roleDAO) : base(roleDAO)
        {
            _roleDAO = roleDAO;
        }

        public async Task<Guid?> GetRoleByNameAsync(string roleName) => await _roleDAO.GetRoleByNameAsync(roleName);
    }
}
