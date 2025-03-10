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

        public async Task<List<Course>> GetAllCourseAsync(int page, int pageSize, string? search, string sortBy, string sortOrder)
        {
            IQueryable<Course> query = _context.Courses;

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.CourseName.Contains(search));
            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(GetSortExpression(sortBy))
                : query.OrderBy(GetSortExpression(sortBy));

            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        }
        private static Expression<Func<Course, object>> GetSortExpression(string sortBy)
        {
            return sortBy.ToLower() switch
            {
                "CourseName" => u => u.CourseName,
                "Time" => u => u.CreatedAt,
                _ => u => u.CourseName
            };
        }

        public async Task<int> GetTotalCourseAsync(string? search)
        {
            IQueryable<Course> query = _context.Courses;
            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.CourseName.Contains(search));
            int page = query.Count();
            return page;
        }
        public async Task<Course?> GetCourseByIdAsync(int id)
        {
            var course = await _dbSet.FindAsync(id);
            return course ?? throw new KeyNotFoundException($"Course with ID {id} not found.");
        }

        public async Task DeleteCourseAsync(int id)
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
    }
}
