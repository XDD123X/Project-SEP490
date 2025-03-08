using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

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
                Courses = courses
            });
        }
        [HttpGet("find-course/{id}")]
        public async Task<IActionResult> GetCourseById(Guid id)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null) return NotFound("Course not found");
            return Ok(course);
        }
        [HttpPost("create-course")]
        public async Task<IActionResult> CreateCourse(CourseDTO course)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var newCourse = _mapper.Map<Course>(course);
            newCourse.Status = 1;
            try
            {
                await _courseRepository.AddAsync(newCourse);
                var courseResponse = _mapper.Map<Course>(newCourse);
                return CreatedAtAction(nameof(GetCourseById), new { id = newCourse.CourseId }, courseResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred while creating class: {ex.Message}");
            }
        }

        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditCourse(Guid id, CourseDTO course)
        {
            var c = await _courseRepository.GetByIdAsync(id);
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
                await _courseRepository.UpdateAsync(c);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while ban account " + id + ": " + ex.Message);
            }
        }
    }
}