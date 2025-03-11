using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IClassSettingRepository : IRepository<ClassSetting>
    {
        Task<ClassSetting?> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
