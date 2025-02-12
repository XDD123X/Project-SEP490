using BusinessObject.Models;
using OTMS_DLA.DAO;
using OTMS_DLA.Interface;
using OTMSAPI.DAO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Repository
{
    public class ClassRepository : Repository<Class>, IClassRepository
    {
        private readonly ClassDAO _classDAO;

        public ClassRepository(ClassDAO classDAO) : base(classDAO)
        {
            _classDAO = classDAO;
        }
        public Task<Class?> GetByClassCodeAsync(string classCode) => _classDAO.GetByClassCode(classCode);
    }
}
