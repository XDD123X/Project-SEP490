using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class RecordDAO : GenericDAO<Record>
    {
        public RecordDAO(OtmsContext context) : base(context) { }

        public async Task<Record> GetRecordBySessionAsync(Guid sessionId)
        {
            return await _context.Records
                .Where(r => r.SessionId == sessionId && r.Status == 1)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Record>> GetListRecordByClassAsync(Guid classId)
        {
            return await _context.Records
                .Where(r => _context.Sessions.Any(s => s.SessionId == r.SessionId && s.ClassId == classId) && r.Status == 1)
                .ToListAsync();
        }
    }
}
