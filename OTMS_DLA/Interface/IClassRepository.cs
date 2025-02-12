using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Interface
{
    public interface IClassRepository : IRepository<Class>
    {
        Task<Class?> GetByClassCodeAsync(string classCode);
        Task<List<Class>> GetAllClassesAsync();
    }
}
