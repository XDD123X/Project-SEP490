using BusinessObject.Models;
using OTMS_DLA.DAO;
using OTMS_DLA.Interface;
using System;
using System.Threading.Tasks;

namespace OTMS_DLA.Repository
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
