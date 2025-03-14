﻿using DocumentFormat.OpenXml.VariantTypes;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace OTMS.DAL.DAO
{
    public class ClassDAO : GenericDAO<Class>
    {

        public ClassDAO(OtmsContext context) : base(context) { }
        public async Task<Class?> GetByClassCode(string classCode)
        {
            return await _dbSet.FirstOrDefaultAsync(a => a.ClassCode.Equals(classCode));
        }

        public async Task<List<Class>> GetAllClassesAsync(int page, int pageSize, string? search, string sortBy, string sortOrder)
        {
            IQueryable<Class> query = _context.Classes;

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.ClassCode.Contains(search) || u.ClassName.Contains(search));
            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(GetSortExpression(sortBy))
                : query.OrderBy(GetSortExpression(sortBy));

            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        }

        private static Expression<Func<Class, object>> GetSortExpression(string sortBy)
        {
            return sortBy.ToLower() switch
            {
                "className" => u => u.ClassName,
                "classCode" => u => u.ClassCode,
                _ => u => u.ClassName
            };
        }
        public async Task<int> GetTotalClassesAsync(string? search)
        {
            IQueryable<Class> query = _context.Classes;

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.ClassName.Contains(search) || u.ClassCode.Contains(search));
            return await query.CountAsync();
        }

        public async Task<List<Class>> getClassByLecturer(Guid lecturerId)
        {
            return await _dbSet.Where(c => c.LecturerId.Equals(lecturerId)).ToListAsync();
        }
        public async Task<List<Class>> GetClassesByStudentAsync(Guid studentId)
        {
            return await _dbSet
                .Where(c => c.ClassStudents.Any(cs => cs.StudentId == studentId))
                .Include(c => c.Course)
                .Include(c => c.Lecturer)
                .Include(c => c.ClassStudents)
                .ThenInclude(cs => cs.Student)
                .ToListAsync();
        }

        public async Task<List<Class>> GetClassList()
        {   

            return await _context.Classes
                .Include(c => c.ClassStudents)
                .ThenInclude( cs => cs.Student)
                .ToListAsync();
        }





    }
}
