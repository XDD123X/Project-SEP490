using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IAccountRepository _accountRepository;
        public ClassController(IClassRepository classRepository, IClassStudentRepository classStudentRepository,IAccountRepository accountRepository, IMapper mapper)
        {
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
            _accountRepository = accountRepository;
            _mapper = mapper;
        }
        [HttpGet("class-list")]
        public async Task<IActionResult> GetClass(
           [FromQuery] int page = 1,
           [FromQuery] int pageSize = 10,
           [FromQuery] string? search = null,
           [FromQuery] string sortBy = "classCode",
           [FromQuery] string sortOrder = "desc")
        {
            var thisClass = await _classRepository.GetAllClassesAsync(page, pageSize, search, sortBy, sortOrder);
            var totalClass = await _classRepository.GetTotalClassesAsync(search);
            var thisClassDTO = _mapper.Map<List<ClassDTO>>(thisClass);
            return Ok(new
            {
                TotalClass = totalClass,
                Page = page,
                PageSize = pageSize,
                Class = thisClassDTO
            });
        }
        [HttpGet("find-class/{id}")]
        public async Task<IActionResult> GetClassById(Guid id)
        {
            var Class = await _classRepository.GetByIdAsync(id);
            if (Class == null) return NotFound("Class not found");
            ClassDTO u = _mapper.Map<ClassDTO>(Class);
            return Ok(u);
        }
        [HttpGet("find-class-by-code")]
        public async Task<IActionResult> GetClassByCode(string code)
        {
            var Class = await _classRepository.GetByClassCodeAsync(code);
            if (Class == null) return NotFound("Class not found");
            ClassDTO u = _mapper.Map<ClassDTO>(Class);
            return Ok(u);
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateClass([FromBody] ClassDTO newClassDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var existingClass = await _classRepository.GetByClassCodeAsync(newClassDTO.ClassCode);
            if (existingClass != null)
            {
                return Conflict("Class code already exists.");
            }
            var newClass = _mapper.Map<Class>(newClassDTO);
            newClass.Status = 1;

            try
            {
                await _classRepository.AddAsync(newClass);
                var classResponse = _mapper.Map<ClassDTO>(newClass);
                return CreatedAtAction(nameof(GetClassById), new { id = newClass.ClassId }, classResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while creating class: {ex.Message}");
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
            try
            {
                await _classRepository.UpdateAsync(c);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while ban account " + id + ": " + ex.Message);
            }
        }
        [HttpPut("diactivate-class/{id}")]
        public async Task<IActionResult> DeActivateClass(Guid id)
        {
            var Class = await _classRepository.GetByIdAsync(id);
            if (Class == null) return NotFound("Class not found");
            Class.Status = 0;
            try
            {
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
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while activate account " + id +": " +ex.Message);
            }
        }

        [HttpPut("asign-student-into-class/{id}")]
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
                await _classStudentRepository.addStudentIntoClass(id, validStudentIds);
                return Ok("Add successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while adding students to class {id}: {ex.Message}");
            }
        }
    }
}
