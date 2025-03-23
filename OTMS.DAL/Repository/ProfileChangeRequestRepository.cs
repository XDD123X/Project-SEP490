using OTMS.BLL.DTOs;
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
    public class ProfileChangeRequestRepository : IProfileChangeRequestRepository
    {

        private readonly ProfileChangeRequestDAO _profileRequestChangeDAO;

        public ProfileChangeRequestRepository(ProfileChangeRequestDAO profileRequestChangeDAO)
        {
            _profileRequestChangeDAO = profileRequestChangeDAO;
        }

        public Task<IEnumerable<ProfileChangeRequest>> GetAllRequestsAsync() => _profileRequestChangeDAO.GetAllRequestsAsync();

        public Task<IEnumerable<ProfileChangeRequest>> GetRequestByStudentIdAsync(Guid studentId) => _profileRequestChangeDAO.GetRequestByStudentIdAsync(studentId);

        public Task<ProfileChangeRequest?> GetLastRequestByStudentIdAsync(Guid studentId) => _profileRequestChangeDAO.GetLastRequestByStudentIdAsync(studentId);

        //public Task<IEnumerable<ProfileChangeRequest>> GetRequestByOfficerIdAsync(Guid officerId) => _profileRequestChangeDAO.GetRequestByOfficerIdAsync(officerId);

        public Task AddRequestAsync(AddProfileChangeRequestModel model) => _profileRequestChangeDAO.AddRequestAsync(model);

        public Task UpdateRequestAsync(UpdateProfileChangeRequestModel model) => _profileRequestChangeDAO.UpdateRequestAsync(model);


        public async Task<ProfileChangeRequest?> GetRequestByRequestChangeIdAsync(Guid requestChangeId)
=> await _profileRequestChangeDAO.GetRequestByRequestChangeIdAsync(requestChangeId);

    }
}
