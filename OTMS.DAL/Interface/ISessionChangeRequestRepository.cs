using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;

namespace OTMS.DAL.Interface
{
    public interface ISessionChangeRequestRepository
    {
        Task<IEnumerable<SessionChangeRequest>> GetAllRequestsAsync();
        Task<SessionChangeRequest?> GetRequestByIdAsync(Guid id);
        Task<(bool isSuccess, string message)> AddRequestAsync(AddSessionChangeRequestDTO model);
        Task<(bool isSuccess, string message)> UpdateRequestAsync(UpdateSessionChangeRequestDTO model);
        Task<IEnumerable<SessionChangeRequest>> GetRequestsByLecturerIdAsync(Guid lecturerId);
        Task<IEnumerable<SessionChangeRequest>> GetPendingRequestsAsync();
        Task<(bool isConflict, string message)> CheckScheduleConflictAsync(Guid lecturerId, DateTime newDate, int newSlot, Guid? excludeSessionId = null);
    }
}
