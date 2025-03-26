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

        public async Task<Role> GetRoleByNameAsync(string roleName) => await _roleDAO.GetRoleByNameAsync(roleName);

        public async Task<List<Role>> GetAllRolesAsync() => await _roleDAO.GetAll();

        public Task<bool> ExistsAsync(string roleName) => _roleDAO.ExistsAsync(roleName);
    }
}
