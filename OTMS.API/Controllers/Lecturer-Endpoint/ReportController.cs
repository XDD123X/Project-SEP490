using System.Net.Http.Headers;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
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


        [HttpPost("Analyze")]
        public IActionResult Analyze([FromBody] AnalyzeRequest request)
        {
            if (!Guid.TryParse(request.SessionId, out var sessionId) || !Guid.TryParse(request.GenerateBy, out var generateBy))
                return BadRequest("Invalid sessionId or generateBy");

            var backgroundService = HttpContext.RequestServices.GetRequiredService<VideoAnalysisBackgroundService>();
            backgroundService.QueueAnalysis(request.SessionId, request.GenerateBy);

            return Ok("Yêu cầu phân tích đã được ghi nhận. Vui lòng đợi kết quả.");
        }

        [HttpGet("GetReportBySessionId")]
        public async Task<IActionResult> GetReportFromRecordBySessionId(Guid sessionId)
        {
            Report report = await _reportRepository.GetReportBySessionIdAsync(sessionId);

            if (report == null)
            {
                return BadRequest("video chua duoc phan tich");
            }
            else if (report != null && report.Status == 1)
            {
                return BadRequest("video dang duoc phan tich");

            }
            else
            {
                return Ok(report.GeminiResponse.ToString());
            }
        }



    }
}
