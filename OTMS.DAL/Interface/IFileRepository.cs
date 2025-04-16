using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;

using File = OTMS.BLL.Models.File;

namespace OTMS.DAL.Interface
{
    public interface IFileRepository
    {
        Task AddAsync(File file);
        Task<File?> GetByIdAsync(Guid fileId);
        Task<List<File>> GetBySessionIdAsync(Guid sessionId);
        Task UpdateAsync(File file);
        Task DeleteAsync(Guid fileId);
    }
}
