using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Interface
{
    public interface IRoleRepository : IRepository<Role>
    {
        Task<Guid?> GetRoleByNameAsync(string roleName);
    }
}
