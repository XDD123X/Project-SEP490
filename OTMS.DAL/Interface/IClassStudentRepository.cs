using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IClassStudentRepository : IRepository<ClassStudent>
    {
        bool checkStuentInClass(Guid classId, Guid studentId);
        Task<bool> checkStudentAnyInClass(Guid studentId);
        Task AddStudentsToClassAsync(Guid classId, List<Guid> listStudentId);
        Task removeStudentIntoClass(Guid id, List<Guid> validStudentIds);
        Task<List<ClassStudent>> GetByClassIdAsync(Guid id);
        Task<ClassStudent> GetByClassAndStudentAsync(Guid classId, Guid studentId);
        Task UpdateClassStudentsAsync(Guid classId, List<Guid> studentIds);
        Task RemoveAllClassStudentsAsync(Guid classId);

        public Task<List<ClassStudentEnrollmentDTO>> GetListOfClassStudentEnrolled(Guid studentId);
    }
}
