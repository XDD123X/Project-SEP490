using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;

namespace OTMS.BLL.Repositories
{
    public interface ISessionChangeRequestRepository
    {
        Task<IEnumerable<SessionChangeRequest>> GetAllRequestsAsync();
        Task<SessionChangeRequest?> GetRequestByIdAsync(Guid id);
        Task AddRequestAsync(AddSessionChangeRequestDTO model);
        Task UpdateRequestAsync(UpdateSessionChangeRequestDTO model);
    }
}
