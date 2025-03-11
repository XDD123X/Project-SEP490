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
    public class ClassRepository : Repository<Class>, IClassRepository
    {
        private readonly ClassDAO _classDAO;

        public ClassRepository(ClassDAO classDAO) : base(classDAO)
        {
            _classDAO = classDAO;
        }

        public async Task<List<Class>> GetAllClassesAsync(int page, int pageSize, string? search, string sortBy, string sortOrder) => await _classDAO.GetAllClassesAsync(page, pageSize, search, sortBy, sortOrder);

        public Task<Class?> GetByClassCodeAsync(string classCode) => _classDAO.GetByClassCode(classCode);

        public Task<List<Class>> getClassByLecturer(Guid lecturerId) => _classDAO.getClassByLecturer(lecturerId);

        public Task<List<Class>> getClassByStudent(Guid studentId) => _classDAO.GetClassesByStudentAsync(studentId);

        public Task<int> GetTotalClassesAsync(string? search) => _classDAO.GetTotalClassesAsync(search);
    }
}
