using DocumentFormat.OpenXml.VariantTypes;
using OTMS.BLL.DTOs;
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
    public class ClassStudentRepository : Repository<ClassStudent>, IClassStudentRepository
    {
        private readonly ClassStudentDAO _classStudentDAO;

        public ClassStudentRepository(ClassStudentDAO classStudentDAO) : base(classStudentDAO)
        {
            _classStudentDAO = classStudentDAO;
        }

        public bool checkStuentInClass(Guid classId, Guid studentId) => _classStudentDAO.checkStuentInClass(classId, studentId);
        public Task<bool> checkStudentAnyInClass(Guid studentId) => _classStudentDAO.CheckStudentInAnyClass(studentId);

        public Task<List<ClassStudent>> GetByClassIdAsync(Guid id) => _classStudentDAO.GetByClassIdAsync(id);

        public Task removeStudentIntoClass(Guid id, List<Guid> validStudentIds) => _classStudentDAO.RemoveStudentsFromClass(id, validStudentIds);
        public async Task<List<ClassStudentEnrollmentDTO>> GetListOfClassStudentEnrolled(Guid studentId) => await _classStudentDAO.GetListOfClassStudentEnrolled(studentId);

        public Task AddStudentsToClassAsync(Guid classId, List<Guid> listStudentId) => _classStudentDAO.addStudentIntoClass(classId, listStudentId);

        public Task UpdateClassStudentsAsync(Guid classId, List<Guid> studentIds) => _classStudentDAO.UpdateClassStudentsAsync(classId, studentIds);

        public Task RemoveAllClassStudentsAsync(Guid classId) => _classStudentDAO.RemoveAllStudentsAsync(classId);

        public Task<ClassStudent> GetByClassAndStudentAsync(Guid classId, Guid studentId) => _classStudentDAO.GetByClassAndStudentAsync(classId, studentId);
    }
}
