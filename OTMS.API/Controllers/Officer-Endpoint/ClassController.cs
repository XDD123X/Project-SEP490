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
        private readonly IMapper _mapper;
        private readonly IAccountRepository _accountRepository;

        public ClassController(IClassRepository classRepository, IClassStudentRepository classStudentRepository, IAccountRepository accountRepository, IMapper mapper)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
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

    }
}
