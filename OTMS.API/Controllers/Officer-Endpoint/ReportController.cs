using System.Net.Http.Headers;
using AutoMapper;
using Azure;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenAI.Chat;
using System.Text;
using DotnetGeminiSDK.Client;
using Mscc.GenerativeAI;
using Xceed.Words.NET;
using System.IO;
using DocumentFormat.OpenXml.Presentation;

namespace OTMS.API.Controllers.Officer_Endpoint
{

    [Route("api/Officer/[controller]")]
    [ApiController]
    public class ReportController : OfficerPolicyController
    {
        private readonly IReportRepository _reportRepository;
        private readonly IRecordRepository _recordRepository;
        private readonly IMapper _mapper;

        private readonly HttpClient client = null;
        private string Apianalyze = "http://127.0.0.1:4000/upload_video";
        private readonly string GeminiApiKey = "AIzaSyCKcdUoSFX8-9s5wNd4Bin94jQrUkbwrqo";

        public ReportController(IMapper mapper, IReportRepository reportRepository, IRecordRepository recordRepository)
        {
            _reportRepository = reportRepository;
            _recordRepository = recordRepository;
            client = new HttpClient();
            var contentType = new MediaTypeWithQualityHeaderValue("application/json");
            client.DefaultRequestHeaders.Accept.Add(contentType);

        }

        //        [HttpPost("GetReportUsingGeminiAi")]
        //        public async Task<ActionResult> GetResult(string reportId)
        //        {
        //            Report report = _reportRepository.GetReportsWithSessionClassAndGeneratedBy(Guid.Parse(reportId)).FirstOrDefault();

        //            try
        //            {
        //                var apiKey = "AIzaSyCKcdUoSFX8-9s5wNd4Bin94jQrUkbwrqo";
        //                var prompt = "Hãy phân tích bầu không khí lớp học dựa vào kết quả nhận diện cảm xúc như sau. Bao gồm các yếu tố:" +
        //                    "Mức độ tham gia của học sinh (dựa trên sự hiện diện)." +
        //                    "Trạng thái cảm xúc chiếm ưu thế." +
        //                    "Nhận xét chung về bầu không khí lớp học (Hào hứng sôi nổi/bình thường/trầm)." +
        //                    "Gợi ý cải thiện (nếu có) để nâng cao bầu không khí lớp học vui vẻ hơn.Đây là kết quả nhận diện: " + report.AnalysisData;

        //                var googleAI = new GoogleAI(apiKey: apiKey);
        //                var model = googleAI.GenerativeModel(model: Model.Gemini15Pro);
        //                var response = await model.GenerateContent(prompt);



        //                var today = DateTime.Now;
        //                string formattedDate = $"Hà Nội, ngày {today.Day} tháng {today.Month} năm {today.Year}";

        //                // Đường dẫn file mẫu và file mới
        //                string templatePath = @"C:\Users\nqt00\Downloads\Meeting_Document.docx";
        //                string newFilePath = @$"C:\Users\nqt00\Downloads\Report_{DateTime.Now:yyyyMMddHHmmss}.docx";

        //                // Tạo bản sao từ file mẫu
        //                System.IO.File.Copy(templatePath, newFilePath, true);
        //// FileStream uploadFileStream = System.IO.File.OpenRead(templatePath);

        //                // Mở file mới và chèn nội dung
        //                using (var doc = DocX.Load(newFilePath))
        //                {
        //                    // Thay thế placeholder trong file Word bằng dữ liệu thực tế
        //                    doc.ReplaceText("{date}", formattedDate);
        //                    doc.ReplaceText("{class_name}", report.Session.Class.ClassName);
        //                    doc.ReplaceText("{session_date}", report.Session.SessionDate.ToString("dd/MM/yyyy"));
        //                    doc.ReplaceText("{analysis_result}", response.Text.Trim());
        //                    doc.ReplaceText("{analyzer_name}", report.GeneratedByNavigation.FullName);

        //                    doc.Save();
        //                }

        //                return Ok($"Report generated: {newFilePath}");


        //            }
        //            catch (Exception ex)
        //            {
        //                return StatusCode(500, $"Internal server error: {ex.Message}");
        //            }
        //        }

        [HttpPost("GetReportUsingGeminiAi")]
        public async Task<ActionResult> GetResult(string reportId)
        {
            Report report = _reportRepository.GetReportsWithSessionClassAndGeneratedBy(Guid.Parse(reportId));

            if(report == null)
            {
                return NotFound("Chua phan tich du lieu.");
            }
            try
            {
                var apiKey = "AIzaSyCKcdUoSFX8-9s5wNd4Bin94jQrUkbwrqo";
                var prompt = "Hãy phân tích bầu không khí lớp học dựa vào kết quả nhận diện cảm xúc như sau. Bao gồm các yếu tố:" +
                    "Mức độ tham gia của học sinh (dựa trên sự hiện diện)." +
                    "Trạng thái cảm xúc chiếm ưu thế." +
                    "Nhận xét chung về bầu không khí lớp học (Hào hứng sôi nổi/bình thường/trầm)." +
                    "Gợi ý cải thiện (nếu có) để nâng cao bầu không khí lớp học vui vẻ hơn.Đây là kết quả nhận diện: " + report.AnalysisData;

                var googleAI = new GoogleAI(apiKey: apiKey);
                var model = googleAI.GenerativeModel(model: Model.Gemini15Pro);
                var response = await model.GenerateContent(prompt);

                var today = DateTime.Now;
                string formattedDate = $"Hà Nội, ngày {today.Day} tháng {today.Month} năm {today.Year}";

                string basePath = AppContext.BaseDirectory;
                string templatePath = Path.Combine(basePath, "Meeting_Document_Report_template.docx");
               
                string tempDirectory = Path.GetTempPath();
                string newFilePath = Path.Combine(tempDirectory, $"Report_{DateTime.Now:yyyyMMddHHmmss}.docx");
                Console.WriteLine("aaaa"+newFilePath);


                System.IO.File.Copy(templatePath, newFilePath, true);

                using (var doc = DocX.Load(newFilePath))
                {
                    
                    doc.ReplaceText("{date}", formattedDate);
                    doc.ReplaceText("{class_name}", report.Session.Class.ClassName);
                    doc.ReplaceText("{session_date}", report.Session.SessionDate.ToString("dd/MM/yyyy"));
                    doc.ReplaceText("{slot}", report.Session.Slot.ToString());
                    doc.ReplaceText("{analysis_result}", response.Text.Trim());
                    doc.ReplaceText("{analyzer_name}", report.GeneratedByNavigation.FullName);


                    foreach (var paragraph in doc.Paragraphs)
                    {
                        paragraph.Font(new Xceed.Document.NET.Font("Times New Roman"));
                    }

                    doc.Save();
                }

                var fileBytes = System.IO.File.ReadAllBytes(newFilePath);
                var fileName = Path.GetFileName(newFilePath);

                System.IO.File.Delete(newFilePath);


                return File(fileBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _reportRepository.GetAllReports();
            return Ok(reports);
        }
        [HttpPost("Analyze")]
        public async Task<IActionResult> Analyze(string sessionId, string generateBy)
        {
            client.Timeout = TimeSpan.FromMinutes(20);

            //var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Files", sessionId, "record", $"record_{sessionId}.mp4");
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Files", sessionId, "record", "record.mp4");

            Console.WriteLine(filePath);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Video file not found.");
            }

            MultipartFormDataContent multipartFormDataContent = new MultipartFormDataContent();

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var byteArrayContent = new ByteArrayContent(fileBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("video/mp4");

            multipartFormDataContent.Add(byteArrayContent, "video", Path.GetFileName(filePath));

            var response = await client.PostAsync(Apianalyze, multipartFormDataContent);

            if (response.IsSuccessStatusCode)
            {
                Record record = _recordRepository.GetRecordBySessionAsync(Guid.Parse(sessionId)).Result;

                var result = await response.Content.ReadAsStringAsync();


                Report report = new Report()
                {
                    RecordId = record.RecordId,
                    AnalysisData = result,
                    GeneratedAt = DateTime.UtcNow,
                    GeneratedBy = Guid.Parse(generateBy),
                    SessionId = Guid.Parse(sessionId),
                    Status = 1
                };
                Console.WriteLine(report.AnalysisData);
                await _reportRepository.AddReport(report);
                return Ok("Thêm dữ liệu thành công,dữ liệu phân tích là: " + result.ToString());

            }
            else
            {
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
        }




        [HttpGet("listModels")]
        public async Task<ActionResult<string>> ListModels()
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("x-goog-api-key", GeminiApiKey);

                    var response = await client.GetAsync("https://generativelanguage.googleapis.com/v1beta/models");

                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadAsStringAsync();
                        return Ok(result);
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        return StatusCode((int)response.StatusCode, errorContent);
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
