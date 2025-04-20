using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OTMS.API.Controllers.Admin_Endpoint
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class ClassSettingController : ControllerBase
    {
        private readonly IClassSettingRepository _classSettingRepository;

        public ClassSettingController(IClassSettingRepository classSettingRepository)
        {
            _classSettingRepository = classSettingRepository;
        }

        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditClassSetting(int id, ClassSetting classSetting)
        {
            var c = await _classSettingRepository.GetByIdAsync(id);
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
                c.SessionPerWeek = classSetting.SessionPerWeek;
                c.SessionTotal = classSetting.SessionTotal;
                c.SlotNumber = classSetting.SlotNumber;
                c.UpdatedAt = DateTime.Now;
                await _classSettingRepository.UpdateAsync(c);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while edit class " + id + ": " + ex.Message);
            }
        }
        [HttpPost("create/{id}")]
        public async Task<IActionResult> CreateClassSetting(int id, ClassSetting classSetting)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                await _classSettingRepository.AddAsync(classSetting);
                return Ok("Create success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while edit class " + id + ": " + ex.Message);
            }
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllClassSetting()
        {
            var c = await _classSettingRepository.GetAllAsync();
            return Ok(c);

        }
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetClassSetting(int id)
        {
            var c = await _classSettingRepository.GetByIdAsync(id);
            return Ok(c);

        }

        [HttpGet("current")]
        public async Task<IActionResult> GetClassSettingCurrent()
        {
            var c = await _classSettingRepository.GetAllAsync();
            return Ok(c.Last());

        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteClassSetting(int id)
        {
            try
            {
                await _classSettingRepository.DeleteAsync(id);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while edit class " + id + ": " + ex.Message);
            }
        }
    }
}
