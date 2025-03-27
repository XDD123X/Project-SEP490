using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class CourseDAO : GenericDAO<Course>
    {
        public CourseDAO(OtmsContext context) : base(context) { }

        public async Task<List<Course>> GetAllActiveCourseAsync()
        {
            return await _dbSet.Where(c => c.Status != 0).ToListAsync();
        }
        public async Task<int> GetTotalCourseAsync(string? search)
        {
            IQueryable<Course> query = _context.Courses;

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.CourseName.Contains(search));

            return await query.CountAsync();
        }
        public async Task<Course?> GetCourseByIdAsync(Guid id)
        {
            var course = await _dbSet.FindAsync(id);
            return course ?? throw new KeyNotFoundException($"Course with ID {id} not found.");
        }

        public async Task DeleteCourseAsync(Guid id)
        {
            Course? course = await _dbSet.FindAsync(id);
            if (course != null)
            {
                _dbSet.Remove(course);
                await _context.SaveChangesAsync();
                return;
            }
            else
            {
                return;
            }
        }

        public async Task<List<Course>> GetCourses()
        {
            return await _context.Courses
                .Include(c => c.CreatedByNavigation)
                .ThenInclude(a => a.Role)
                .ToListAsync();
        }

        public async Task<Course?> GetCourseById(Guid id)
        {
            return await _context.Courses
                .Include(c => c.CreatedByNavigation)
                .ThenInclude(a => a.Role)
                .FirstOrDefaultAsync(c => c.CourseId == id);
        }

        public async Task<bool> ExistsAsync(string courseName)
        {
            return await _context.Courses.AnyAsync(c => c.CourseName.ToLower() == courseName.ToLower());
        }
    }
}
