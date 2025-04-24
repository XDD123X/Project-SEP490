using DocumentFormat.OpenXml.Office2013.Drawing.ChartStyle;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.VariantTypes;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class ClassStudentDAO : GenericDAO<ClassStudent>
    {
        public ClassStudentDAO(OtmsContext context) : base(context)
        {
        }
        public async Task addStudentIntoClass(Guid classId, List<Guid> studentIds)
        {
            if (studentIds == null || !studentIds.Any()) return;

            var existingStudents = await _context.ClassStudents
            .Where(cs => cs.ClassId == classId && studentIds.Contains(cs.StudentId))
            .Select(cs => cs.StudentId)
            .ToListAsync();

            var newStudents = studentIds.Except(existingStudents)
            .Select(studentId => new ClassStudent
            {
                ClassId = classId,
                StudentId = studentId
            })
            .ToList();

            if (newStudents.Any())
            {
                await _context.ClassStudents.AddRangeAsync(newStudents);
                await _context.SaveChangesAsync();
            }

        }

        public bool checkStuentInClass(Guid classId, Guid studentId)
        {
            return _dbSet.Any(sc => sc.ClassId == classId && sc.StudentId == studentId);
        }

        public async Task RemoveStudentsFromClass(Guid classId, List<Guid> listStudentId)
        {
            var studentsToRemove = await _dbSet
                .Where(cs => cs.ClassId == classId && listStudentId.Contains(cs.StudentId))
                .ToListAsync();

            if (studentsToRemove.Any())
            {
                _dbSet.RemoveRange(studentsToRemove);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<List<ClassStudent>> GetByClassIdAsync(Guid id)
        {
            var students = await _dbSet.Where(sc => sc.ClassId == id).ToListAsync();
            return students;
        }
        public async Task<ClassStudent> GetByClassAndStudentAsync(Guid classId, Guid studentId)
        {
            var student = await _dbSet.Where(sc => sc.ClassId == classId && sc.StudentId == studentId).FirstOrDefaultAsync();
            return student;
        }
        public async Task<List<ClassStudentEnrollmentDTO>> GetListOfClassStudentEnrolled(Guid studentId)
        {
            var enrolledClasses = await (from cs in _dbSet
                                         join c in _context.Classes on cs.ClassId equals c.ClassId
                                         join co in _context.Courses on c.CourseId equals co.CourseId
                                         where cs.StudentId == studentId
                                         select new ClassStudentEnrollmentDTO
                                         {
                                             ClassId = c.ClassId,
                                             ClassCode = c.ClassCode,
                                             ClassName = c.ClassName,
                                             CourseName = co.CourseName,
                                             StartDate = c.StartDate ?? DateTime.MinValue,
                                             EndDate = c.EndDate ?? DateTime.MinValue,
                                             Status = c.Status.ToString()
                                         }).ToListAsync();

            return enrolledClasses;
        }

        //cho luồng lập lịch
        public async Task<List<Guid>> GetOtherClassesOfStudentsAsync(List<Guid> studentIds)
        {
            return await _context.ClassStudents
                .Where(cs => studentIds.Contains(cs.StudentId))
                .Select(cs => cs.ClassId)
                .Distinct()
                .ToListAsync();
        }


        public async Task<List<Guid>> GetStudentInClassAsync(Guid classId)
        {
            return await _context.ClassStudents
                .Where(cs => cs.ClassId == classId)
                .Select(cs => cs.StudentId)
                .ToListAsync();

        }

        public async Task<bool> CheckStudentInAnyClass(Guid studentId)
        {
            return await _dbSet.AnyAsync(sc => sc.StudentId.Equals(studentId));
        }

        public async Task UpdateClassStudentsAsync(Guid classId, List<Guid> studentIds)
        {
            var existingStudents = _context.ClassStudents.Where(cs => cs.ClassId == classId);
            _context.ClassStudents.RemoveRange(existingStudents);
            await _context.SaveChangesAsync();

            var newStudents = studentIds.Select(studentId => new ClassStudent
            {
                ClassId = classId,
                StudentId = studentId
            }).ToList();

            await _context.ClassStudents.AddRangeAsync(newStudents);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAllStudentsAsync(Guid classId)
        {
            var existingStudents = _context.ClassStudents.Where(cs => cs.ClassId == classId);
            _context.ClassStudents.RemoveRange(existingStudents);
            await _context.SaveChangesAsync();
        }

    }
}
