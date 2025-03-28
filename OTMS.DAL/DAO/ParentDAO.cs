using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace OTMS.DAL.DAO
{
    public class ParentDAO : GenericDAO<Parent>
    {

        public ParentDAO(OtmsContext context) : base(context) { }

        public async Task<List<Parent>> GetAllParentsAsync()
        {
            return (await GetAllAsync()).ToList();
        }

        public async Task<bool> DeleteParentsByStudentId(Guid studentId)
        {
            var existingParents = await _context.Parents
                .Where(p => p.StudentId == studentId)
                .ToListAsync();

            if (!existingParents.Any())
            {
                return false;
            }

            _context.Parents.RemoveRange(existingParents);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Guid> AddParent(Parent parent)
        {
            if (parent == null)
            {
                throw new ArgumentNullException(nameof(parent), "Parent data cannot be null");
            }

            parent.ParentId = Guid.NewGuid();
            await _context.Parents.AddAsync(parent);
            await _context.SaveChangesAsync();

            return parent.ParentId;
        }

        public async Task<List<Parent>> GetParentsByStudentIdAsync(Guid studentId)
        {
            return await _dbSet
                .Where(p => p.StudentId == studentId)
                .ToListAsync();
        }

    }
}
