using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IClassRepository : IRepository<Class>
    {
        Task<Class?> GetByClassCodeAsync(string classCode);
        Task<List<Class>> GetAllClassesAsync(int page, int pageSize, string? search, string sortBy, string sortOrder);
        Task<int> GetTotalClassesAsync(string? search);
        Task<List<Class>> getClassByLecturer(Guid lecturerId);
    }
}
