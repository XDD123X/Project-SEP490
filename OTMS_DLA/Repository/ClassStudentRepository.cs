using BusinessObject.Models;
using OTMS_DLA.DAO;
using OTMS_DLA.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Repository
{
    public class ClassStudentRepository : Repository<ClassStudent>, IClassStudentRepository
    {
        private readonly ClassStudentDAO _classStudentDAO;

    public ClassStudentRepository(ClassStudentDAO classStudentDAO) : base(classStudentDAO)
    {
        _classStudentDAO = classStudentDAO;
    }
        public Task addStudentIntoClass(Guid classId, List<Guid> listStudentId) => _classStudentDAO.addStudentIntoClass(classId, listStudentId);
    }
}
