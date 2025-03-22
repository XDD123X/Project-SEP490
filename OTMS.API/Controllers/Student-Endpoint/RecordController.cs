using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Student_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecordController : ControllerBase
    {
        private readonly IRecordRepository _recordRepository;
        private readonly IMapper _mapper;
        public RecordController(IRecordRepository recordRepository, IMapper mapper)
        {
            _mapper = mapper;
            _recordRepository = recordRepository;
        }
        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetRecordBySession(Guid sessionId)
        {
            var record = await _recordRepository.GetRecordBySessionAsync(sessionId);
            if (record == null)
                return NotFound("No record found for this session.");

            return Ok(record);
        }
        [HttpGet("class/{classId}")]
        public async Task<IActionResult> GetListRecordByClass(Guid classId)
        {
            var records = await _recordRepository.GetListRecordByClassAsync(classId);
            return Ok(records);
        }
    }
}
