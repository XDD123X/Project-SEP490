using DocumentFormat.OpenXml.Office2013.Drawing.ChartStyle;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
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
        public async Task addStudentIntoClass(Guid classId, List<Guid> listStudentId)
        {
            Class? thisclass = _context.Classes.FirstOrDefault(c => c.ClassId == classId);
            List<ClassStudent> students = new List<ClassStudent>();
            foreach (var item in listStudentId)
            {
                ClassStudent student = new ClassStudent()
                {
                    ClassId = classId,
                    StudentId = item,
                    CreatedAt = DateTime.Now,
                };
                students.Add(student);
            }
            if (students.Count > 0)
            {
                await _dbSet.AddRangeAsync(students);
                await _context.SaveChangesAsync();
            }
            return;
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

    }
}
