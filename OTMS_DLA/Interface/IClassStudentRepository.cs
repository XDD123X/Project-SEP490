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
        Task addStudentIntoClass(Guid classId, List<Guid> listStudentId);
    }
}
