using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Interface
{
    public interface IClassStudentRepository : IRepository<ClassStudent>
    {
        Task addStudentIntoClass(Guid classId, List<Guid> listStudentId);
    }
}
