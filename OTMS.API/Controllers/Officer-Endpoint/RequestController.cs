using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/Officer/[controller]")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly IProfileChangeRequestRepository _repository;
        private readonly IAccountRepository _accountRepository;

        private readonly IMapper _mapper;

        public RequestController(IProfileChangeRequestRepository repository, IMapper mapper, IAccountRepository accountRepository)
        {
            _repository = repository;
            _mapper = mapper;
            _accountRepository = accountRepository;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _repository.GetAllRequestsAsync();
            if (requests == null || !requests.Any())
                return NotFound("No requests found");

            var sortedRequests = requests.OrderByDescending(r => r.CreatedAt).ToList();

            var requestDtos = _mapper.Map<List<ProfileChangeRequestDTO>>(sortedRequests);
            return Ok(requestDtos);
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetRequestByStudentId(Guid studentId)
        {
            var requests = await _repository.GetRequestByStudentIdAsync(studentId);


            if (requests == null || !requests.Any())
                return NotFound($"No requests found for studentId: {studentId}");

            //sort
            var sortedRequests = requests.OrderByDescending(r => r.CreatedAt).ToList();

            // Map danh sách kết quả
            var requestDtos = _mapper.Map<List<ProfileChangeRequestDTO>>(sortedRequests);
            return Ok(requestDtos);
        }


        [HttpPut("update")]
        public async Task<IActionResult> UpdateRequest([FromBody] UpdateProfileChangeRequestModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);


            ProfileChangeRequest request = await _repository.GetRequestByRequestChangeIdAsync(model.RequestChangeId);


           // ProfileChangeRequest request = await _repository.GetLastRequestByStudentIdAsync(studentId);
            if (request == null) return NotFound("Request ko thay not found");

            await _accountRepository.updateImageAccount(request.AccountId, request.ImgUrlNew);


            await _repository.UpdateRequestAsync(model);

            return NoContent();
        }
    }
}
