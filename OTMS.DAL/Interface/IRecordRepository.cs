using Microsoft.AspNetCore.Http;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IRecordRepository : IRepository<Record>
    {
        Task<List<Record>> GetListRecordByClassAsync(Guid classId);
        Task<Record> GetRecordBySessionAsync(Guid sessionId);
        Task addNewRecord(Record record); 

        Task updateRecord(Record record);
        Task<Record> GetReportFromRecordBySessionId(Guid sessionId);

    }
}
