using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.API.Controllers.Admin_Endpoint;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/Lecturer/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IClassRepository _classRepository;
        private readonly IMapper _mapper;

        public CourseController(ICourseRepository courseRepository, IClassRepository classRepository, IMapper mapper)
        {
            _courseRepository = courseRepository;
            _classRepository = classRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _courseRepository.GetCourses();
            if (courses == null) return NotFound();

            var mappedCourses = _mapper.Map<List<CourseDTO>>(courses);
            return Ok(mappedCourses);
        }

        // Lấy thông tin chi tiết một khóa học
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null) return NotFound();

            var mappedCourse = _mapper.Map<CourseDTO>(course);
            return Ok(mappedCourse);
        }

        // Thêm khóa học mới
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] CourseDTO courseDTO)
        {
            if (courseDTO == null) return BadRequest("Invalid data");

            var courseEntity = _mapper.Map<Course>(courseDTO);
            courseEntity.CourseId = Guid.NewGuid();

            await _courseRepository.AddAsync(courseEntity);
            return Ok(courseEntity.CourseId);
        }

        // Cập nhật thông tin khóa học
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> Edit(Guid id, [FromBody] CourseDTO courseDTO)
        {
            if (courseDTO == null) return BadRequest("Invalid data");

            var existingCourse = await _courseRepository.GetByIdAsync(id);
            if (existingCourse == null) return NotFound();

            _mapper.Map(courseDTO, existingCourse);
            await _courseRepository.UpdateAsync(existingCourse);

            return Ok("Updated successfully");
        }

        // Xóa khóa học
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existingCourse = await _courseRepository.GetByIdAsync(id);
            if (existingCourse == null) return NotFound();

            await _courseRepository.DeleteAsync(existingCourse.CourseId);
            return Ok("Deleted successfully");
        }

        //Check Exist Class By CourseId
        [HttpGet("check-usage/{courseId}")]
        public async Task<IActionResult> CheckCourseUsage(Guid courseId)
        {
            try
            {
                var classes = await _classRepository.GetAllAsync();
                int classCount = classes.Count(c => c.CourseId == courseId);

                return Ok(new { courseId, classCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

    }
}
