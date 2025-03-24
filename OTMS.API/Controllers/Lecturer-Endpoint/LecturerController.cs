using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IAttendanceRepository _attendanceRepository;

        public LecturerController(
            IMapper mapper,
            IScheduleRepository scheduleRepository,
            IAccountRepository accountRepository,
            IClassRepository classRepository,
            IClassStudentRepository classStudentRepository,
            IAttendanceRepository attendanceRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
            _accountRepository = accountRepository;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
            _attendanceRepository = attendanceRepository;
        }

        [HttpGet("all-lecturer-schedule")]
        public async Task<IActionResult> GetLecturerSchedule(Guid lecturerId)
        {
            var lecturerSchedule = await _scheduleRepository.GetByLecturerIdAsync(lecturerId);
            if (lecturerSchedule == null)
                return NotFound("Lecturer schedule not found.");

            return Ok(new { lecturerSchedule });
        }
        [HttpGet("get-lecturer-class")]
        public async Task<IActionResult> GetLecturerClass (Guid lecturerId)
        {
            var lecturerClass = await _classRepository.getClassByLecturer(lecturerId);
            if (lecturerClass == null)
                return NotFound("Lecturer class not found.");

            return Ok(new { lecturerClass });
        }

       
    }
}