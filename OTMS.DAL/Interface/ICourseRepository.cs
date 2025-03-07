using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface ICourseRepository : IRepository<Course>
    {
        Task<List<Course>> GetAllCourseAsync(int page, int pageSize, string? search, string sortBy, string sortOrder);
        Task<int> GetTotalCourseAsync(string? search);
    }
}
