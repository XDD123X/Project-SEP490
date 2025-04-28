using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/lecturer/[controller]")]
    [ApiController]
    //[Authorize]
    public class LecturerScheduleController : ControllerBase
    {
        private readonly ILecturerScheduleRepository _lecturerScheduleRepository;
        private readonly IMapper _mapper;

        public LecturerScheduleController(ILecturerScheduleRepository lecturerScheduleRepository, IMapper mapper)
        {
            _lecturerScheduleRepository = lecturerScheduleRepository;
            _mapper = mapper;
        }

        // 1️
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var schedules = await _lecturerScheduleRepository.GetAll();
            var reponse = _mapper.Map<List<LecturerScheduleDTO>>(schedules);

            return Ok(reponse);
        }
        // 2️
        [HttpGet("id/{scheduleId}")]
        public async Task<IActionResult> GetById(Guid scheduleId)
        {
            var schedule = await _lecturerScheduleRepository.GetById(scheduleId);
            if (schedule == null)
            {
                return NotFound("No Lecturer Schedule Found.");
            }
            var reponse = _mapper.Map<LecturerScheduleDTO>(schedule);
            return Ok(reponse);
        }

        // 3
        [HttpGet("lecturer/{lecturerId}")]
        public async Task<IActionResult> GetByLecturerId(Guid lecturerId)
        {
            var schedule = await _lecturerScheduleRepository.GetByLecturerId(lecturerId);
            var reponse = _mapper.Map<LecturerScheduleDTO>(schedule);
            return Ok(reponse);
        }

        // 4
        [HttpPost("add")]
        public async Task<IActionResult> Create([FromBody] LecturerScheduleUpdateModel model)
        {
            if (model == null)
            {
                return BadRequest("Bad Request.");
            }

            var add = new LecturerSchedule
            {
                ScheduleId = new Guid(),
                LecturerId = model.LecturerId,
                WeekdayAvailable = model.WeekdayAvailable,
                SlotAvailable = model.SlotAvailable,
                UpdatedAt = DateTime.Now,
            };

            var result = await _lecturerScheduleRepository.Create(add);
            if (!result)
            {
                return BadRequest("Lecturer Schedule Add Failed.");
            }

            return Ok("Lecturer Schedule Added Successfully.");
        }

        // 5️
        [HttpPut("update/{scheduleId}")]
        public async Task<IActionResult> Update(Guid scheduleId, [FromBody] LecturerScheduleUpdateModel update)
        {
            if (update == null || scheduleId != update.ScheduleId)
            {
                return BadRequest("Bad Request.");
            }

            var updateSchedule = new LecturerSchedule
            {
                ScheduleId = scheduleId,
                LecturerId = update.LecturerId,
                WeekdayAvailable = update.WeekdayAvailable,
                SlotAvailable = update.SlotAvailable,
                UpdatedAt = DateTime.Now
            };

            var result = await _lecturerScheduleRepository.Update(updateSchedule);
            if (!result)
            {
                return BadRequest("Lecturer Schedule Update Failed.");
            }

            return Ok("Lecturer Schedule Updated Successfully.");
        }

        // 6️
        [HttpDelete("delete/{scheduleId}")]
        public async Task<IActionResult> Delete(Guid scheduleId)
        {
            var result = await _lecturerScheduleRepository.Delete(scheduleId);
            if (!result)
            {
                return NotFound("NotFound/Invalid Lecturer Schedule.");
            }

            return Ok("Lecturer Schedule Removed.");
        }
    }
}
