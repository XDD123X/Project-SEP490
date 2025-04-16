using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using File = OTMS.BLL.Models.File;
namespace OTMS.DAL.DAO
{
    public class FileDAO
    {
        private readonly OtmsContext _context;

        public FileDAO(OtmsContext context)
        {
            _context = context;
        }

        public async Task AddAsync(File file)
        {
            await _context.Files.AddAsync(file);
            await _context.SaveChangesAsync();
        }

        public async Task<File?> GetByIdAsync(Guid fileId)
        {
            return await _context.Files.FindAsync(fileId);
        }

        public async Task<List<File>> GetBySessionIdAsync(Guid sessionId)
        {
            return await _context.Files
                .Where(f => f.SessionId == sessionId)
                .ToListAsync();
        }

        public async Task UpdateAsync(File file)
        {
            _context.Files.Update(file);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid fileId)
        {
            var file = await _context.Files.FindAsync(fileId);
            if (file != null)
            {
                _context.Files.Remove(file);
                await _context.SaveChangesAsync();
            }
        }
    }
}
