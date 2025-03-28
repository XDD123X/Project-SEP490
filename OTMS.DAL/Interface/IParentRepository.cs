using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;

namespace OTMS.DAL.Interface
{
    public interface IParentRepository
    {
        public Task<List<Parent>> GetAllParentsAsync();
        public Task<List<Parent>> GetParentsByStudentIdAsync(Guid studentId);
        public Task<Guid> AddParentAsync(Parent parent);
        public Task<bool> DeleteParentsByStudentIdAsync(Guid studentId);
    }
}
