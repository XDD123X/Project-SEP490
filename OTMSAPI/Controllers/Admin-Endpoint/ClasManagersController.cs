using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClasManagersController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        public ClasManagersController(IClassRepository classRepository, IClassStudentRepository classStudentRepository, IMapper mapper)
        {
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
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
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditClass(Guid id, ClassDTO classDTO)
        {
            var c = await _classRepository.GetByIdAsync(id);
            if (c == null)
            {
                return NotFound();
            }
            if (!string.IsNullOrEmpty(classDTO.ClassName))
            {
                c.ClassName = classDTO.ClassName;
            }
            if (!string.IsNullOrEmpty(classDTO.ClassUrl))
            {
                c.ClassUrl = classDTO.ClassUrl;
            }
            if (classDTO.TotalSession.HasValue)
            {
                c.TotalSession = (int)classDTO.TotalSession;
            }
            try
            {
                await _classRepository.UpdateAsync(c);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while ban account " + id);
            }
        }
        [HttpPut("disable-class/{id}")]
        public async Task<IActionResult> BanClass(Guid id)
        {
            var Class = await _classRepository.GetByIdAsync(id);
            if (Class == null) return NotFound("Class not found");
            Class.Status = 0;
            try
            {
                await _classRepository.UpdateAsync(Class);
                return Ok("Class is disable");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while ban account " + id);
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
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while activate account " + id);
            }
        }
    }
}
