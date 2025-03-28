using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.API.Controllers.Admin_Endpoint;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IClassRepository _classRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IAccountRepository _accountRepository;

        public ClassController(IMapper mapper, IClassRepository classRepository, ICourseRepository courseRepository, IClassStudentRepository classStudentRepository, IAccountRepository accountRepository)
        {
            _mapper = mapper;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _classStudentRepository = classStudentRepository;
            _accountRepository = accountRepository;
        }

        [HttpGet("class-list")]
        public async Task<IActionResult> GetClass()
        {
            var classList = await _classRepository.GetAllAsync();
            return Ok(classList);
        }
        [HttpGet("find-class/{id}")]
        public async Task<IActionResult> GetClassById(Guid id)
        {
            var Class = await _classRepository.GetByIdAsync(id);
            if (Class == null) return NotFound("Class not found");
            return Ok(Class);
        }
        [HttpGet("find-class-by-code")]
        public async Task<IActionResult> GetClassByCode(string code)
        {
            var Class = await _classRepository.GetByClassCodeAsync(code);
            if (Class == null) return NotFound("Class not found");
            return Ok(Class);
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateClass(ClassAddModel addClass)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var existingClass = await _classRepository.GetByClassCodeAsync(addClass.ClassCode);
            if (existingClass != null)
            {
                return Conflict("Class code already exists.");
            }

            var newClass = new Class
            {
                ClassCode = addClass.ClassCode,
                ClassName = addClass.ClassName,
                LecturerId = addClass.LecturerId,
                CourseId = addClass.CourseId,
                TotalSession = 0,
                StartDate = addClass.StartDate,
                EndDate = addClass.EndDate,
                ClassUrl = addClass.ClassUrl,
                Status = addClass.Status,
                CreatedAt = DateTime.Now
            };

            try
            {
                await _classRepository.AddAsync(newClass);
                return Ok(new
                {
                    message = "Create class successful",
                    classId = newClass.ClassId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = $"An error occurred while creating class: {ex.Message}" });
            }
        }

        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditClass(Guid id, ClassDTO classDTO)
        {
            var c = await _classRepository.GetByIdAsync(id);
            if (c == null)
            {
                return NotFound();
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (classDTO.LecturerId != null)
            {
                var l = await _accountRepository.GetByIdAsync((Guid)classDTO.LecturerId);
                if (l == null || !l.Role.Name.Equals("Lecturer"))
                {
                    return BadRequest("Please select correct lecturer");
                }
            }
            try
            {
                _mapper.Map(classDTO, c);
                c.UpdatedAt = DateTime.Now;
                await _classRepository.UpdateAsync(c);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while edit class " + id + ": " + ex.Message);
            }
        }
        [HttpPut("diactivate-class/{id}")]
        public async Task<IActionResult> DeActivateClass(Guid id)
        {
            var Class = await _classRepository.GetByIdAsync(id);
            if (Class == null) return NotFound("Class not found");
            var studentsInClass = await _classStudentRepository.GetByClassIdAsync(id);
            if (studentsInClass.Count != 0)
            {
                BadRequest("You cannot delete this class because it is still student in that class");
            }
            try
            {
                Class.Status = 0;
                await _classRepository.UpdateAsync(Class);
                return Ok("Class is Deactivate");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while ban account " + id + ": " + ex.Message);
            }
        }

        [HttpPut("activate-class/{id}")]
        public async Task<IActionResult> ActivateClass(Guid id)
        {
            var Class = await _classRepository.GetByIdAsync(id);
            if (Class == null) return NotFound("Class not found");
            Class.Status = 1;
            try
            {
                await _classRepository.UpdateAsync(Class);
                return Ok("Class is activate");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while activate account " + id + ": " + ex.Message);
            }
        }
        [HttpGet("get-student-in-class/{id}")]
        public async Task<IActionResult> GetStudentInClass(Guid id)
        {
            var students = await _accountRepository.GetByStudentByClass(id);
            return Ok(students);
        }
        [HttpPost("asign-student-into-class/{id}")]
        public async Task<IActionResult> AsignStudentIntoClass(Guid id, List<Guid> listStudentId)
        {
            var classObj = await _classRepository.GetByIdAsync(id);
            if (classObj == null) return NotFound("Class not found");
            var validStudentIds = new List<Guid>();
            foreach (var studentid in listStudentId)
            {
                var student = await _accountRepository.GetByIdAsync(studentid);
                if (student != null && !_classStudentRepository.checkStuentInClass(id, studentid))
                {
                    validStudentIds.Add(studentid);
                }
            }
            if (validStudentIds.Count == 0) return BadRequest("No valid students to add");
            try
            {
                //await _classStudentRepository.addStudentsToClass(id, validStudentIds);
                return Ok("Add successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while adding students to class {id}: {ex.Message}");
            }
        }
        [HttpDelete("remove-student-from-class/{id}")]
        public async Task<IActionResult> RemoveStudentFromClass(Guid id, List<Guid> listStudentId)
        {
            var classObj = await _classRepository.GetByIdAsync(id);
            if (classObj == null) return NotFound("Class not found");
            var validStudentIds = new List<Guid>();
            foreach (var studentid in listStudentId)
            {
                var student = await _accountRepository.GetByIdAsync(studentid);
                if (student != null && _classStudentRepository.checkStuentInClass(id, studentid))
                {
                    validStudentIds.Add(studentid);
                }
            }
            if (validStudentIds.Count == 0) return BadRequest("No valid students to remove");
            try
            {
                await _classStudentRepository.removeStudentIntoClass(id, validStudentIds);
                return Ok("Remove successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while adding students to class {id}: {ex.Message}");
            }
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteClass(Guid id)
        {
            var existingClass = await _classRepository.GetByIdAsync(id);
            if (existingClass == null)
            {
                return NotFound("Class not found.");
            }
            var studentsInClass = await _classStudentRepository.GetByClassIdAsync(id);
            if (studentsInClass.Any())
            {
                List<Guid> studentIds = new List<Guid>();
                foreach (var student in studentsInClass)
                {
                    studentIds.Add(student.StudentId);
                }
                await _classStudentRepository.removeStudentIntoClass(id, studentIds);
            }
            await _classRepository.DeleteAsync(id);

            return Ok("Class deleted successfully.");
        }

    }
}
