using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OTMS.DAL.Interface;
using AutoMapper;
using OTMS.BLL.Models;
using OTMS.DAL.Repository;
using OTMS.BLL.DTOs;
using System.Security.Claims;

namespace OTMS.API.Controllers
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

        [HttpPost("upload")]
        public async Task<IActionResult> UploadRecord([FromBody] UploadRecord newRecord)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                Record r = _mapper.Map<Record>(newRecord);
                var userIdClaim = User.FindFirst("uid");;
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid createdBy))
                {
                    r.UploadedBy = createdBy;
                }
                r.CreatedAt = DateTime.Now;
                await _recordRepository.AddAsync(r);
                return Ok(new
                {
                    message = "Upload record successful",
                    recordId = r.RecordId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = $"An error occurred while upload record: {ex.Message}" });
            }
        }

       
    }
}
