using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class RecordReposiroty : Repository<Record>, IRecordRepository
    {
        private readonly RecordDAO _recordDAO;

        public RecordReposiroty(RecordDAO recordDAO) : base(recordDAO)
        {
            _recordDAO = recordDAO;
        }

        public Task<List<Record>> GetListRecordByClassAsync(Guid classId) => _recordDAO.GetListRecordByClassAsync(classId);

        public Task<Record> GetRecordBySessionAsync(Guid sessionId) => _recordDAO.GetRecordBySessionAsync(sessionId);

        public  Task addNewRecord(Record record) => _recordDAO.addNewRecord(record);

        Task IRecordRepository.updateRecord(Record record) => _recordDAO.UpdateAsync(record);

        public Task<Record> GetReportFromRecordBySessionId(Guid sessionId)
        {
            return _recordDAO.GetReportFromRecordBySessionId(sessionId);
        }


    }
}
