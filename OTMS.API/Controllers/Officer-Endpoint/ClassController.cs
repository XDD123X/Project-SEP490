using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/officer/[controller]")]
    [ApiController]
    public class ClassController : OfficerPolicyController
    {
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IMapper _mapper;
        private readonly IAccountRepository _accountRepository;

        public ClassController(ISessionRepository sessionRepository, IClassRepository classRepository, IClassStudentRepository classStudentRepository, IAccountRepository accountRepository, IMapper mapper)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
            _sessionRepository = sessionRepository;
        }

        [HttpPost("add-student")]
        public async Task<IActionResult> AddStudentsToClass([FromBody] AddStudentModel model)
        {
            if (model == null || model.ClassId == Guid.Empty || model.StudentIds == null || !model.StudentIds.Any())
            {
                return BadRequest(new { message = "Invalid input data." });
            }

            // Kiểm tra xem lớp học có tồn tại không
            var existingClass = await _classRepository.GetByIdAsync(model.ClassId);
            if (existingClass == null)
            {
                return NotFound(new { message = "Class not found." });
            }

            // Kiểm tra xem học sinh đã tồn tại trong lớp chưa
            //var existingStudents = await _classStudentRepository.GetStudentsByClassIdAsync(model.ClassId);
            var existingStudents = await _classStudentRepository.GetByClassIdAsync(model.ClassId);
            var existingStudentIds = existingStudents.Select(s => s.StudentId).ToHashSet();

            var newStudents = model.StudentIds.Where(id => !existingStudentIds.Contains(id)).ToList();

            if (!newStudents.Any())
            {
                return BadRequest(new { message = "All students are already in the class." });
            }

            // Thêm học sinh vào lớp
            //var classStudentEntities = newStudents.Select(studentId => new ClassStudent
            //{
            //    ClassId = model.ClassId,
            //    StudentId = studentId
            //}).ToList();

            var classStudentEntities = newStudents.Select(studentId => new ClassStudent
            {
                ClassId = model.ClassId,
                StudentId = studentId
            }).ToList();

            await _classStudentRepository.AddStudentsToClassAsync(model.ClassId, model.StudentIds);

            return Ok(new { message = "Students added successfully!", addedStudents = newStudents });
        }

        [HttpPost("update-student")]
        public async Task<IActionResult> UpdateClassStudents([FromBody] AddStudentModel model)
        {
            if (model == null || model.ClassId == Guid.Empty || model.StudentIds == null)
            {
                return BadRequest(new { message = "Invalid input data." });
            }

            try
            {
                await _classStudentRepository.UpdateClassStudentsAsync(model.ClassId, model.StudentIds);
                return Ok(new { message = "Class students updated successfully!" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        [HttpGet("{classId}")]
        public async Task<IActionResult> GetClassById(Guid classId)
        {
            var classList = await _classRepository.GetClassList();

            var classEntity = classList.FirstOrDefault(c => c.ClassId == classId);

            if (classEntity == null) return NotFound("Class not found.");

            var response = _mapper.Map<ClassDTO>(classEntity);

            return Ok(response);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateClass(ClassUpdateDTO classUpdate)
        {
            if (classUpdate == null)
            {
                return BadRequest("Invalid class data");
            }

            var classItem = await _classRepository.GetByIdAsync(classUpdate.ClassId);
            if (classItem == null)
            {
                return NotFound("Class not found");
            }

            classItem.ClassCode = classUpdate.ClassCode;
            classItem.ClassName = classUpdate.ClassName;
            classItem.LecturerId = classUpdate.LecturerId;
            classItem.CourseId = classUpdate.CourseId;
            classItem.TotalSession = classUpdate.TotalSession;
            classItem.ClassUrl = classUpdate.ClassUrl;
            classItem.Scheduled = classUpdate.Scheduled;
            classItem.StartDate = classUpdate.StartDate;
            classItem.EndDate = classUpdate.EndDate;
            classItem.Status = classUpdate.Status;

            await _classRepository.UpdateAsync(classItem);
            return Ok(new
            {
                id = classItem.ClassId,
                message = "Class updated successfully"
            });
        }

        [HttpDelete("{classId}")]
        public async Task<IActionResult> DeleteClassById(string classId)
        {
            if (!Guid.TryParse(classId, out var guid))
            {
                return BadRequest("Invalid classId format.");
            }

            var classItem = await _classRepository.GetByIdAsync(guid);
            if (classItem == null)
            {
                return NotFound("Class not found.");
            }

            try
            {
                await _classRepository.DeleteAsync(guid);
                return Ok(guid);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to delete class. Error: {ex.Message}");
            }
        }

        [HttpPost("clear-session/{classId}")]
        public async Task<IActionResult> ClearClassSession(Guid classId)
        {
            if (classId == Guid.Empty)
                return BadRequest("Invalid classId.");

            var classItem = await _classRepository.GetByIdAsync(classId);
            if (classItem == null)
                return NotFound("Class not found.");

            if (classItem.TotalSession == 0)
                return BadRequest("This class has no sessions to clear.");

            var result = await _sessionRepository.ClearClassSessionByClassId(classId);
            if (!result)
                return StatusCode(500, "Failed to clear sessions due to an internal error.");

            // Cập nhật thông tin lớp học
            classItem.TotalSession = 0;
            classItem.Scheduled = false;

            await _classRepository.UpdateAsync(classItem);

            return Ok("Sessions cleared and class updated successfully.");
        }

    }
}
