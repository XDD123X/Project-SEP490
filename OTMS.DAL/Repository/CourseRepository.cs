using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class CourseRepository : Repository<Course>, ICourseRepository
    {
        private readonly CourseDAO _courseDAO;

        public CourseRepository(CourseDAO courseDAO) : base(courseDAO)
        {
            _courseDAO = courseDAO;
        }

        public Task DeleteAsync(int id) => _courseDAO.DeleteCourseAsync(id);

        public Task<List<Course>> GetAllActiveCourseAsync() => _courseDAO.GetAllActiveCourseAsync();

        public Task<Course?> GetByIdAsync(int id) => _courseDAO.GetCourseByIdAsync(id);

        public Task<int> GetTotalCourseAsync(string? search) => _courseDAO.GetTotalCourseAsync(search);
    }
}
