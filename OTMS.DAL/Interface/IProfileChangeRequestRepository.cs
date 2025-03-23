using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IProfileChangeRequestRepository
    {
        Task<IEnumerable<ProfileChangeRequest>> GetAllRequestsAsync();
        Task<IEnumerable<ProfileChangeRequest>> GetRequestByStudentIdAsync(Guid studentId);
        Task<ProfileChangeRequest?> GetLastRequestByStudentIdAsync(Guid studentId);
        Task AddRequestAsync(AddProfileChangeRequestModel model);
        Task UpdateRequestAsync(UpdateProfileChangeRequestModel model);

        public Task<ProfileChangeRequest?> GetRequestByRequestChangeIdAsync(Guid requestChangeId);

    }
}
