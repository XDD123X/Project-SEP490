using DocumentFormat.OpenXml.Office2010.Excel;
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
        new Task<Course?> GetByIdAsync(Guid id);
        new Task DeleteAsync(Guid id);
        Task<List<Course>> GetAllActiveCourseAsync();
        Task<int> GetTotalCourseAsync(string? search);
        Task<List<Course>> GetCourses();
        Task<Course?> GetCourseByIdAsync(Guid id);

        Task<bool> ExistsAsync(string courseName);
    }
}
