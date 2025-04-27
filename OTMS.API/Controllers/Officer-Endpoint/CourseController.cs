using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.API.Controllers.Admin_Endpoint;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/Officer/[controller]")]
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
            var course = await _courseRepository.GetCourseByIdAsync(id);
            if (course == null) return NotFound();

            var mappedCourse = _mapper.Map<CourseDTO>(course);
            return Ok(mappedCourse);
        }

        // Thêm khóa học mới
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] AddCourseModel model)
        {
            if (model == null) return BadRequest("Invalid data");

            var courseEntity = new Course
            {
                CourseId = Guid.NewGuid(),
                CourseName = model.CourseName,
                Description = model.Description,
                CreatedBy = model.CreatedBy,
                CreatedAt = DateTime.Now,
                UpdatedAt = null,
                Status = 2 // Default Pending
            };

            await _courseRepository.AddAsync(courseEntity);
            return Ok(courseEntity.CourseId);
        }

        // Cập nhật thông tin khóa học
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> Edit(Guid id, [FromBody] AddCourseModel courseDTO)
        {
            if (courseDTO == null) return BadRequest("Invalid data");

            var existingCourse = await _courseRepository.GetByIdAsync(id);
            if (existingCourse == null) return NotFound();

            existingCourse.CourseName = courseDTO.CourseName;
            existingCourse.Description = courseDTO.Description;
            await _courseRepository.UpdateAsync(existingCourse);

            return Ok("Updated successfully");
        }

        //Update Status ONly
        [HttpPut("edit-status/{id}")]
        public async Task<IActionResult> EditStatus(Guid id, [FromBody] UpdateCourseModel model)
        {
            if (model == null) return BadRequest("Invalid data");

            // 1. Kiểm tra khóa học có tồn tại không
            var existingCourse = await _courseRepository.GetByIdAsync(id);
            if (existingCourse == null) return NotFound("Course not found");

            // 2. Kiểm tra xem có lớp học nào đang sử dụng khóa học này không
            var classes = await _classRepository.GetAllAsync();
            bool isCourseInUse = classes.Any(c => c.CourseId == id);

            // 3. Nếu khóa học đang được sử dụng, chỉ cho phép status = 1 hoặc 2
            if (isCourseInUse && (model.Status != 1 && model.Status != 2))
            {
                return BadRequest("Cannot set status to 0 because the course is in use.");
            }

            // 4. Nếu không có lớp học nào đang sử dụng, có thể đặt status về 0
            existingCourse.Status = model.Status;
            existingCourse.UpdatedAt = DateTime.Now; // Cập nhật thời gian chỉnh sửa

            await _courseRepository.UpdateAsync(existingCourse);

            return Ok("Status updated successfully");
        }


        // Xóa khóa học
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existingCourse = await _courseRepository.GetByIdAsync(id);
            if (existingCourse == null) return NotFound();

            if (existingCourse.Status != 0)
                return BadRequest("Only courses with status 0 can be deleted");

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
