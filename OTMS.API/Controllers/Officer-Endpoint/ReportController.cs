using System.Net.Http.Headers;
using AutoMapper;
using Azure;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace OTMS.API.Controllers.Officer_Endpoint
{

    [Route("api/Officer/[controller]")]
    [ApiController]
    public class ReportController : OfficerPolicyController
    {
        private readonly IReportRepository _reportRepository;

        private readonly IMapper _mapper;

        private readonly HttpClient client = null;
        private string Apianalyze = "http://127.0.0.1:4000/upload_video";

        public ReportController(IMapper mapper, IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;

            client = new HttpClient();
            var contentType = new MediaTypeWithQualityHeaderValue("application/json");
            client.DefaultRequestHeaders.Accept.Add(contentType);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _reportRepository.GetAllReports();
            return Ok(reports);
        }



        [HttpPost("Analyze")]
        public async Task<IActionResult> Analyze(IFormFile file)
        {
            try
            {
                var formContent = new MultipartFormDataContent();
                var fileContent = new StreamContent(file.OpenReadStream());
                fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
                formContent.Add(fileContent, "video", file.FileName);

                HttpResponseMessage httpResponseMessage = await client.PostAsync(Apianalyze, formContent);

                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    var response = await httpResponseMessage.Content.ReadAsStringAsync();
                    return Ok(response);
                }
                else
                {
                    return BadRequest($"Request failed with status code: {httpResponseMessage.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }



        //lưu y:json khi test phai
        [HttpPut("AddReport")]
        public async Task<IActionResult> AddReport(ReportDTO reportDTO)
        {
            Report report = new Report()
            {
                RecordId = reportDTO.RecordId,
                AnalysisData = reportDTO.analysis_data.ToString(),
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = reportDTO.Generated_By,
                SessionId = reportDTO.SessionId,
                Status = 1
            };
            Console.WriteLine(report.AnalysisData);
            await _reportRepository.AddReport(report);
            return Ok("Thêm dữ liệu thành công ");
        }



    }
}
