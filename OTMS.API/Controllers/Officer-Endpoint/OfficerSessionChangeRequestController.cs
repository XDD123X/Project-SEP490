using Microsoft.AspNetCore.Mvc;
using OTMS.API.Controllers.Officer_Endpoint;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Repositories;
using OTMS.DAL.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("officer/request/change-session")]
[ApiController]
public class OfficerSessionChangeRequestController : OfficerPolicyController
{
    private readonly ISessionChangeRequestRepository _sessionChangeRequestRepository;

    public OfficerSessionChangeRequestController(ISessionChangeRequestRepository sessionChangeRequestRepository)
    {
        _sessionChangeRequestRepository = sessionChangeRequestRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SessionChangeRequest>>> GetAllRequests()
    {
        var requests = await _sessionChangeRequestRepository.GetAllRequestsAsync();
        return Ok(requests);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRequest(Guid id, [FromBody] UpdateSessionChangeRequestDTO model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingRequest = await _sessionChangeRequestRepository.GetRequestByIdAsync(id);
        if (existingRequest == null)
        {
            return NotFound();
        }

        await _sessionChangeRequestRepository.UpdateRequestAsync(model);
        return Ok(new { message = "Yêu cầu đổi lịch đã được cập nhật." });
    }
}
