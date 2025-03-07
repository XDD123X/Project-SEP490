using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Admin_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ICourseRepository _courseRepository;

        [HttpGet("course-list")]
        public async Task<IActionResult> GetCourse(
              [FromQuery] int page = 1,
              [FromQuery] int pageSize = 10,
              [FromQuery] string? search = null,
              [FromQuery] string sortBy = "CourseName",
              [FromQuery] string sortOrder = "desc")
        {
            var courses = await _courseRepository.GetAllCourseAsync(page, pageSize, search, sortBy, sortOrder);
            var totalCourse = await _courseRepository.GetTotalCourseAsync(search);
            //var thisCourseDTO = _mapper.Map<List<CourseDTO>>(thisCourse);
            return Ok(new
            {
                TotalCourse = totalCourse,
                Page = page,
                PageSize = pageSize,
                Course = courses
            });
        }
        [HttpGet("find-Course/{id}")]
        public async Task<IActionResult> GetCourseById(Guid id)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null) return NotFound("Course not found");
            //CourseDTO u = _mapper.Map<CourseDTO>(Course);
            return Ok(course);
        }
    }
}