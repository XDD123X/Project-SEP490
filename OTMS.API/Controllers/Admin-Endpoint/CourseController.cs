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
        private readonly IClassRepository _classRepository;
        private IAccountRepository _accountRepository;

        public CourseController(IMapper mapper, ICourseRepository courseRepository, IClassRepository classRepository)
        {
            _mapper = mapper;
            _courseRepository = courseRepository;
            _classRepository = classRepository;
        }

        [HttpGet("course-list")]
        public async Task<IActionResult> GetCourse()
        {
            var courses = await _courseRepository.GetAllActiveCourseAsync();
            //var thisCourseDTO = _mapper.Map<List<CourseDTO>>(thisCourse);
            return Ok(courses);
        }
        [HttpGet("find/{id}")]
        public async Task<IActionResult> GetCourseById(int id)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null) return NotFound("Course not found");
            return Ok(course);
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateCourse(CourseDTO course, Guid UserId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var creator = await _accountRepository.GetByIdAsync(UserId);
            if(creator == null || (creator.Role.Name != "Officer"))
            {
                return BadRequest("Invalid account");
            }
            var newCourse = _mapper.Map<Course>(course);
            newCourse.Status = 1;
            newCourse.CreatedBy = UserId;
            newCourse.CreatedAt = DateTime.Now;
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
        public async Task<IActionResult> EditCourse(int id, Guid userId, CourseDTO courseDTO)
        {
            var c = await _courseRepository.GetByIdAsync(id);
            if (c == null)
            {
                return NotFound();
            }
            if (!c.CreatedBy.Equals(userId))
            {
                return BadRequest();
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                _mapper.Map(courseDTO, c);
                c.UpdatedAt = DateTime.Now;
                await _courseRepository.UpdateAsync(c);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating course " + id + ": " + ex.Message);
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null)
            {
                return NotFound(new { message = "Course not found" });
            }
            bool hasClasses = await _classRepository.checkCouresHasAnyClass(id);
            if (hasClasses)
            {
                return BadRequest(new { message = "Cannot delete course because there are existing classes linked to it." });
            }

            try
            {
                course.Status = 0;
                await _courseRepository.UpdateAsync(course);
                return Ok(new { message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = $"An error occurred while deleting course {id}: {ex.Message}" });
            }
        }
    }
}