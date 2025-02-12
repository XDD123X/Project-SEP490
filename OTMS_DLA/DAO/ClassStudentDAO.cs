using BusinessObject.Models;
using DocumentFormat.OpenXml.Presentation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.DAO
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
    }
}
