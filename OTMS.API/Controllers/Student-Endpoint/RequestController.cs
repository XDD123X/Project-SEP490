using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Student_Endpoint
{
    [Route("api/Student/[controller]")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly IProfileChangeRequestRepository _repository;
        private readonly IMapper _mapper;

        public RequestController(IProfileChangeRequestRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [NonAction]
        public async Task<IActionResult> GetRequestByStudentId(Guid studentId)
        {
            var request = await _repository.GetRequestByStudentIdAsync(studentId);
            if (request == null) return NotFound();
            var requestDtos = _mapper.Map<ProfileChangeRequestDTO>(request);
            return Ok(requestDtos);
        }

        [Authorize]
        [HttpGet("last")]
        public async Task<IActionResult> GetLastRequestByStudentId()
        {
            // Get ID From JWT token
            var userIdClaim = User.FindFirst("uid");
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token");

            // Parse
            if (!Guid.TryParse(userIdClaim.Value, out Guid studentId))
                return BadRequest("Invalid User ID format");

            // Request
            var request = await _repository.GetLastRequestByStudentIdAsync(studentId);
            if (request == null) return Ok((ProfileChangeRequestDTO?)null);
            var requestDtos = _mapper.Map<ProfileChangeRequestDTO>(request);
            return Ok(requestDtos);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddRequest([FromBody] AddProfileChangeRequestModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdClaim = User.FindFirst("uid");
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token");

            // Parse
            if (!Guid.TryParse(userIdClaim.Value, out Guid studentId))
                return BadRequest("Invalid User ID format");

            Console.WriteLine(studentId.ToString());

            model.AccountId = studentId;
            Console.WriteLine(studentId.ToString());
            await _repository.AddRequestAsync(model);
            return Ok("Request Created Successfully");
        }

    }
}
