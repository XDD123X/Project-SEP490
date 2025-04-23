using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Services;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/Officer/[controller]")]
    [ApiController]
    public class RequestController : OfficerPolicyController
    {
        private readonly IProfileChangeRequestRepository _profileChangeRepository;
        private readonly ISessionChangeRequestRepository _sessionChangeRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IMapper _mapper;

        public RequestController(IProfileChangeRequestRepository profileChangeRepository, ISessionChangeRequestRepository sessionChangeRepository, ISessionRepository sessionRepository, IAccountRepository accountRepository, IClassStudentRepository classStudentRepository, IMapper mapper)
        {
            _profileChangeRepository = profileChangeRepository;
            _sessionChangeRepository = sessionChangeRepository;
            _sessionRepository = sessionRepository;
            _accountRepository = accountRepository;
            _classStudentRepository = classStudentRepository;
            _mapper = mapper;
        }

        [HttpGet("student/all")]
        public async Task<IActionResult> GetAllStudentRequests()
        {
            var requests = await _profileChangeRepository.GetAllRequestsAsync();
            if (requests == null || !requests.Any())
                return NotFound("No requests found");

            var sortedRequests = requests.OrderByDescending(r => r.CreatedAt).ToList();

            var requestDtos = _mapper.Map<List<ProfileChangeRequestDTO>>(sortedRequests);
            return Ok(requestDtos);
        }

        [HttpGet("lecturer/all")]
        public async Task<IActionResult> GetAllLecturerRequests()
        {
            var requests = await _sessionChangeRepository.GetAllRequestsAsync();
            if (requests == null || !requests.Any())
                return NotFound("No requests found");

            var sortedRequests = requests.OrderByDescending(r => r.CreatedAt).ToList();

            var requestDtos = _mapper.Map<List<SessionChangeRequestDTO>>(sortedRequests);
            return Ok(requestDtos);
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetRequestByStudentId(Guid studentId)
        {
            var requests = await _profileChangeRepository.GetRequestByStudentIdAsync(studentId);


            if (requests == null || !requests.Any())
                return NotFound($"No requests found for studentId: {studentId}");

            //sort
            var sortedRequests = requests.OrderByDescending(r => r.CreatedAt).ToList();

            // Map danh sách kết quả
            var requestDtos = _mapper.Map<List<ProfileChangeRequestDTO>>(sortedRequests);
            return Ok(requestDtos);
        }

        [HttpGet("lecturer/{lecturerId}")]
        public async Task<IActionResult> GetRequestByLecturerId(Guid lecturerId)
        {
            var requests = await _sessionChangeRepository.GetRequestsByLecturerIdAsync(lecturerId);


            if (requests == null || !requests.Any())
                return NotFound($"No requests found for lecturer: {lecturerId}");

            //sort
            var sortedRequests = requests.OrderByDescending(r => r.CreatedAt).ToList();

            // Map danh sách kết quả
            var requestDtos = _mapper.Map<List<SessionChangeRequestDTO>>(sortedRequests);
            return Ok(requestDtos);
        }


        [HttpPut("student/update")]
        public async Task<IActionResult> UpdateStudentRequest([FromBody] UpdateProfileChangeRequestModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);


            ProfileChangeRequest request = await _profileChangeRepository.GetRequestByRequestChangeIdAsync(model.RequestChangeId);


            // ProfileChangeRequest request = await _repository.GetLastRequestByStudentIdAsync(studentId);
            if (request == null) return NotFound("Request ko thay not found");

            await _accountRepository.updateImageAccount(request.AccountId, request.ImgUrlNew);


            await _profileChangeRepository.UpdateRequestAsync(model);

            return NoContent();
        }

        //Ko xài đến( bản này đã bị lỗi), dùng cái bên officersessionchangerequestcontroller
        //[HttpPut("lecturer/update")]
        //public async Task<IActionResult> UpdateRequest([FromBody] UpdateSessionChangeRequestDTO model)
        //{
        //    var request = await _sessionChangeRepository.GetRequestByIdAsync(model.RequestChangeId);
        //    if (request == null)
        //    {
        //        return NotFound(new { success = false, message = "Session Request Change Not Found." });
        //    }

        //    var (isSuccess, message) = await _sessionChangeRepository.UpdateRequestAsync(model);
        //    if (!isSuccess)
        //    {
        //        return BadRequest(new { success = false, message });
        //    }

        //    // Gửi email thông báo cho giảng viên
        //    if (!string.IsNullOrEmpty(request.Lecturer?.Email))
        //    {
        //        string statusText = model.Status switch
        //        {
        //            1 => "đã được duyệt",
        //            2 => "đã bị từ chối",
        //            _ => "đã được cập nhật"
        //        };

        //        string emailSubject = "Thông báo về yêu cầu thay đổi lịch học";
        //        string emailBody = $@"
        //    <h3>Kính gửi {request.Lecturer.FullName},</h3>
        //    <p>Yêu cầu thay đổi lịch học của bạn cho buổi học ngày {request.OldDate} (Slot {request.OldSlot}) 
        //       sang ngày {request.NewDate} (Slot {request.NewSlot}) {statusText}.</p>
        //    <p>Lý do: {model.Description ?? "Lý do vui lòng hỏi lại officer"}</p>
        //    <p>Trân trọng,</p>
        //    <p>Future Me Center</p>";

        //        // Gửi email qua background service
        //        EmailBackgroundService.EnqueueEmail(request.Lecturer.Email, emailSubject, emailBody);
        //    }

        //    // Gửi email cho tất cả sinh viên trong lớp nếu yêu cầu được duyệt
        //    if (model.Status == 1 && request.Session != null)
        //    {
        //        var classId = request.Session.ClassId;
        //        var classStudents = await _classStudentRepository.GetByClassIdAsync(classId);

        //        if (classStudents.Any())
        //        {
        //            foreach (var student in classStudents.Select(cs => cs.Student))
        //            {
        //                if (!string.IsNullOrEmpty(student?.Email))
        //                {
        //                    string emailSubject = $"Thông báo về thay đổi lịch học lớp {request.Session.Class?.ClassName}";
        //                    string emailBody = $@"
        //                <h3>Kính gửi {student.FullName},</h3>
        //                <p>Lịch học lớp <strong>{request.Session.Class?.ClassName}</strong> đã được thay đổi:</p>
        //                <p>- Từ: Ngày {request.OldDate} (Slot {request.OldSlot})</p>
        //                <p>- Thành: Ngày {request.NewDate} (Slot {request.NewSlot})</p>
        //                <p>Lý do: {model.Description ?? "Để biết thêm chi tiết, vui lòng liên hệ giảng viên hoặc trung tâm."}</p>
        //                <p>Xin lưu ý điều chỉnh lịch học của bạn cho phù hợp.</p>
        //                <p>Trân trọng,</p>
        //                <p>Future Me Center</p>";

        //                    // Gửi email qua background service
        //                    EmailBackgroundService.EnqueueEmail(student.Email, emailSubject, emailBody);
        //                }
        //            }
        //        }
        //    }

        //    return Ok(new { success = true, message });
        //}
    }
}
