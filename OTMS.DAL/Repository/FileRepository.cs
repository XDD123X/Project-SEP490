using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class FileRepository : IFileRepository
    {
        private readonly FileDAO _fileDao;

        public FileRepository(FileDAO fileDao)
        {
            _fileDao = fileDao;
        }

        public Task AddAsync(BLL.Models.File file) => _fileDao.AddAsync(file);

        public Task<BLL.Models.File?> GetByIdAsync(Guid fileId) =>  _fileDao.GetByIdAsync(fileId);
        public Task<List<BLL.Models.File>> GetBySessionIdAsync(Guid sessionId) => _fileDao.GetBySessionIdAsync(sessionId);

        public Task UpdateAsync(BLL.Models.File file) => _fileDao.UpdateAsync(file);

        public Task DeleteAsync(Guid fileId) => _fileDao.DeleteAsync(fileId);
    }
}
