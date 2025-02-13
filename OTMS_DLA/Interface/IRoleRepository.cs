using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IRoleRepository : IRepository<Role>
    {
        Task<Guid?> GetRoleByNameAsync(string roleName);
    }
}
