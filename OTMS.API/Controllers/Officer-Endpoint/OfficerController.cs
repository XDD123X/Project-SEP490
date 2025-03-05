using AutoMapper;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;
using System.Globalization;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfficerController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IScheduleRepository _scheduleRepository;

        public OfficerController(IMapper mapper, IScheduleRepository scheduleRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
        }
        [HttpGet("all-schedule")]
        public async Task<IActionResult> GetAllSchedule()
        {
            var allSchedule = await _scheduleRepository.GetAllAsync();
            return Ok(new
            {
                allSchedule
            });
        }

    }
}
