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

        public Task<List<Course>> GetAllCourseAsync(int page, int pageSize, string? search, string sortBy, string sortOrder) => _courseDAO.GetAllCourseAsync(page, pageSize, search, sortBy, sortOrder);

        public Task<int> GetTotalCourseAsync(string? search) => _courseDAO.GetTotalCourseAsync(search);
    }
}
