using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Repositories;
using OTMS.DAL.Repositories;
using System;
using System.Threading.Tasks;

[Route("lecturer/request/change-session")]
[ApiController]
public class LecturerSessionChangeRequestController : ControllerBase
{
    private readonly ISessionChangeRequestRepository _sessionChangeRequestRepository;

    public LecturerSessionChangeRequestController(ISessionChangeRequestRepository sessionChangeRequestRepository)
    {
        _sessionChangeRequestRepository = sessionChangeRequestRepository;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitRequest([FromBody] AddSessionChangeRequestDTO model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        await _sessionChangeRequestRepository.AddRequestAsync(model);
        return Ok(new { message = "Yêu cầu đổi lịch đã được gửi." });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SessionChangeRequest>> GetRequestById(Guid id)
    {
        var request = await _sessionChangeRequestRepository.GetRequestByIdAsync(id);
        if (request == null)
        {
            return NotFound();
        }
        return Ok(request);
    }
}
