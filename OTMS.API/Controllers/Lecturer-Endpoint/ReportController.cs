using System.Net.Http.Headers;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mscc.GenerativeAI;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Services;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{

    [Route("api/Lecturer/[controller]")]

    public class ReportController : ControllerBase
    {
        private readonly IReportRepository _reportRepository;
        private readonly IRecordRepository _recordRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IMapper _mapper;
        private readonly HttpClient client = null;
        private readonly VideoAnalysisBackgroundService _videoAnalysisBackgroundService;


        public ReportController(IMapper mapper, IReportRepository reportRepository, IRecordRepository recordRepository, ISessionRepository sessionRepository, VideoAnalysisBackgroundService videoAnalysisBackgroundService)
        {
            _reportRepository = reportRepository;
            _recordRepository = recordRepository;
            client = new HttpClient();
            var contentType = new MediaTypeWithQualityHeaderValue("application/json");
            client.DefaultRequestHeaders.Accept.Add(contentType);
            _sessionRepository = sessionRepository;
            _videoAnalysisBackgroundService = videoAnalysisBackgroundService;
        }






        //}


        //[HttpPost("Analyze")]
        //public async Task<IActionResult> Analyze([FromBody] AnalyzeRequest request)
        //{
        //    if (!Guid.TryParse(request.SessionId, out var sessionId) && !Guid.TryParse(request.GenerateBy, out var generateBy))
        //        return BadRequest("Invalid sessionId or generateBy");

        //    var userIdClaim = User.FindFirst("uid");

        //    try
        //    {
        //        using var checkClient = new HttpClient();
        //        checkClient.Timeout = TimeSpan.FromSeconds(10); 
        //        var optionsRequest = new HttpRequestMessage(HttpMethod.Options, "http://127.0.0.1:4000/upload_video");
        //        var optionsResponse = await checkClient.SendAsync(optionsRequest);

        //        if (!optionsResponse.IsSuccessStatusCode)
        //        {
        //            Console.WriteLine("Dịch vụ phân tích video (upload_video) đang không khả dụng.");
        //            return StatusCode(500, "Dịch vụ phân tích video (upload_video) đang không khả dụng.");

        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Không thể kết nối tới dịch vụ phân tích video: {ex.Message}");

        //        return StatusCode(500, $"Không thể kết nối tới dịch vụ phân tích video: {ex.Message}");

        //    }

        //    Record record = await _recordRepository.GetRecordBySessionAsync(sessionId);
        //    if (record == null)
        //    {
        //        return BadRequest("SessionId không hợp lệ.");
        //    }


        //    var backgroundService = HttpContext.RequestServices.GetRequiredService<VideoAnalysisBackgroundService>();
        //    backgroundService.QueueAnalysis(request.SessionId, string.IsNullOrEmpty(request.GenerateBy) ? userIdClaim.Value : request.GenerateBy);
        //    return Ok("Yêu cầu phân tích đã được ghi nhận. Vui lòng đợi kết quả.");
        //}



        [HttpPost("Analyze")]
        public async Task<IActionResult> Analyze([FromBody] AnalyzeRequest request)
        {
            Console.WriteLine("Da goi api analyze");
            if (!Guid.TryParse(request.SessionId, out var sessionId))
                return BadRequest("Invalid sessionId");

            var userIdClaim = User.FindFirst("uid");

            try
            {
                using var checkClient = new HttpClient();
                checkClient.Timeout = TimeSpan.FromSeconds(10);
                var optionsRequest = new HttpRequestMessage(HttpMethod.Options, "http://127.0.0.1:4000/upload_video");
                var optionsResponse = await checkClient.SendAsync(optionsRequest);

                if (!optionsResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine("Dịch vụ phân tích video (upload_video) đang không khả dụng.");
                    return StatusCode(500, "Dịch vụ phân tích video (upload_video) đang không khả dụng.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Không thể kết nối tới dịch vụ phân tích video: {ex.Message}");
                return StatusCode(500, $"Không thể kết nối tới dịch vụ phân tích video: {ex.Message}");
            }

            // Tìm record
            var record = await _recordRepository.GetRecordBySessionAsync(sessionId);
            if (record == null)
            {
                return BadRequest("SessionId không hợp lệ.");
            }

            // Add hoặc update report
            var existingReport = await _reportRepository.GetReportBySessionIdAsync(sessionId);
            Guid generatedByGuid = string.IsNullOrEmpty(request.GenerateBy) ? Guid.Parse(userIdClaim.Value) : Guid.Parse(request.GenerateBy);

            if (existingReport == null)
            {
                var newReport = new Report
                {
                    RecordId = record.RecordId,
                    GeneratedAt = DateTime.Now,
                    GeneratedBy = generatedByGuid,
                    SessionId = sessionId,
                    Status = 1,
                };
                await _reportRepository.AddReport(newReport);
            }
            else
            {
                existingReport.GeneratedAt = DateTime.Now;
                existingReport.GeneratedBy = generatedByGuid;
                existingReport.Status = 1;
                await _reportRepository.UpdateAsync(existingReport);
            }

            Console.WriteLine($"Đã tạo report cho session {sessionId} với userId {generatedByGuid}");

            var backgroundService = HttpContext.RequestServices.GetRequiredService<VideoAnalysisBackgroundService>();
            backgroundService.QueueAnalysis(request.SessionId, generatedByGuid.ToString());

            return Ok("Yêu cầu phân tích đã được ghi nhận. Vui lòng đợi kết quả.");
        }



        [HttpGet("GetReportBySessionId")]
        public async Task<IActionResult> GetReportFromRecordBySessionId(Guid sessionId)
        {
            if (sessionId == Guid.Empty)
            {
                return BadRequest("SessionId không hợp lệ.");
            }
            Report report = await _reportRepository.GetReportBySessionIdAsync(sessionId);

            if (report == null)
            {
                return BadRequest("video chua duoc phan tich");
            }
            else if (report != null && report.Status == 1)
            {
                return BadRequest("video dang duoc phan tich");

            }
            else if (report != null && report.Status == -1)
            {
                return BadRequest("Phan tich loi,chua the phan tich duoc video");

            }
            else
            {
                return Ok(report);
            }
        }



    }
}
