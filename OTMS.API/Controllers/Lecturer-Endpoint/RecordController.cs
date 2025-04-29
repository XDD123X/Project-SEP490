using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OTMS.DAL.Interface;
using AutoMapper;
using OTMS.BLL.Models;
using OTMS.DAL.Repository;
using OTMS.BLL.DTOs;
using System.Security.Claims;

namespace OTMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecordController : ControllerBase
    {
        private readonly IRecordRepository _recordRepository;
        private readonly IReportRepository _reportRepository;
        private readonly IMapper _mapper;
        public RecordController(IRecordRepository recordRepository, IMapper mapper,IReportRepository reportRepository)
        {
            _mapper = mapper;
            _recordRepository = recordRepository;
            _reportRepository = reportRepository;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadRecord([FromBody] UploadRecord newRecord)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                Record r = _mapper.Map<Record>(newRecord);
                var userIdClaim = User.FindFirst("uid"); ;
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid createdBy))
                {
                    r.UploadedBy = createdBy;
                }
                r.CreatedAt = DateTime.Now;
                await _recordRepository.AddAsync(r);
                return Ok(new
                {
                    message = "Upload record successful",
                    recordId = r.RecordId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = $"An error occurred while upload record: {ex.Message}" });
            }
        }



        [HttpDelete("delete/{recordId}")]
        public async Task<IActionResult> DeleteRecord(Guid recordId)
        {
            try
            {
                var record = await _recordRepository.GetByIdAsync(recordId);
                Console.WriteLine(record.SessionId.ToString());
                if (record == null)
                {
                    return NotFound(new { message = "Record not found" });
                }


                Report reportByRecordId = await _reportRepository.GetReportBySessionIdAsync(record.SessionId);


                await _reportRepository.DeleteAsync(reportByRecordId.ReportId);
                await _recordRepository.DeleteAsync(recordId);


                return Ok(new { message = "Record deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = $"An error occurred while deleting the record: {ex.Message}" });
            }
        }


        [HttpPut("update/{recordId}")]
        public async Task<IActionResult> UpdateRecord(Guid recordId, [FromBody] UploadRecord updatedRecord)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingRecord = await _recordRepository.GetByIdAsync(recordId);
                if (existingRecord == null)
                {
                    return NotFound(new { message = "Record not found" });
                }

                _mapper.Map(updatedRecord, existingRecord);
                existingRecord.UpdatedAt = DateTime.Now;

                await _recordRepository.updateRecord(existingRecord);

                return Ok(new { message = "Record updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = $"An error occurred while updating the record: {ex.Message}" });
            }
        }



        //[HttpPost("add-new-record")]
        //public async Task<IActionResult> AddNewRecord([FromBody] UploadRecord newRecord)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    try
        //    {
        //        Record record = _mapper.Map<Record>(newRecord);
        //        var userIdClaim = User.FindFirst("uid");
        //        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid createdBy))
        //        {
        //            record.UploadedBy = createdBy;
        //        }
        //        record.CreatedAt = DateTime.Now;

        //        await _recordRepository.addNewRecord(record);

        //        return Ok(new
        //        {
        //            message = "New record added successfully",
        //            recordId = record.RecordId
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            new { message = $"An error occurred while adding the record: {ex.Message}" });
        //    }
        //}




    }
}
