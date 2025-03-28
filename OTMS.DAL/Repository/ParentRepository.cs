using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;

namespace OTMS.DAL.Repository
{
    public class ParentRepository : Repository<Parent>, IParentRepository
    {

        private readonly ParentDAO _parentDAO;

        public ParentRepository(ParentDAO parentDAO) : base(parentDAO)
        {
            _parentDAO = parentDAO;
        }

        public async Task<List<Parent>> GetAllParentsAsync()
        {
            return await _parentDAO.GetAllParentsAsync();
        }


        public Task<Guid> AddParentAsync(Parent parent) => _parentDAO.AddParent(parent);

        public Task<bool> DeleteParentsByStudentIdAsync(Guid studentId) => _parentDAO.DeleteParentsByStudentId(studentId);

        public Task<List<Parent>> GetParentsByStudentIdAsync(Guid studentId) => _parentDAO.GetParentsByStudentIdAsync(studentId);
    }
}
