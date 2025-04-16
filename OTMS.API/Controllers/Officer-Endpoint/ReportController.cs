﻿using System.Net.Http.Headers;
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
using DocumentFormat.OpenXml.Bibliography;

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

            var recordDir = Path.Combine(Directory.GetCurrentDirectory(), "Files", sessionId, "record");
            if (!Directory.Exists(recordDir))
            {
                return NotFound("Record directory not found.");
            }

            // Tìm file video bất kỳ trong thư mục "record"
            var supportedExtensions = new[] { ".mp4", ".webm", ".mov", ".avi", ".mkv" };
            var videoFile = Directory.GetFiles(recordDir)
                                     .FirstOrDefault(f => supportedExtensions.Contains(Path.GetExtension(f).ToLower()));

            if (videoFile == null)
            {
                return NotFound("Video file not found.");
            }

            Console.WriteLine("Using video file: " + videoFile);

            MultipartFormDataContent multipartFormDataContent = new MultipartFormDataContent();

            var fileBytes = await System.IO.File.ReadAllBytesAsync(videoFile);
            var byteArrayContent = new ByteArrayContent(fileBytes);

            // Thiết lập content-type theo phần mở rộng
            string extension = Path.GetExtension(videoFile).ToLower();
            string mimeType = extension switch
            {
                ".mp4" => "video/mp4",
                ".webm" => "video/webm",
                ".mov" => "video/quicktime",
                ".avi" => "video/x-msvideo",
                ".mkv" => "video/x-matroska",
                _ => "application/octet-stream"
            };

            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            multipartFormDataContent.Add(byteArrayContent, "video", Path.GetFileName(videoFile));

            var response = await client.PostAsync(Apianalyze, multipartFormDataContent);

            if (response.IsSuccessStatusCode)
            {
                // Lấy record theo sessionId
                Record record = await _recordRepository.GetRecordBySessionAsync(Guid.Parse(sessionId));

                // Đọc kết quả trả về từ API
                var result = await response.Content.ReadAsStringAsync();

                // Kiểm tra nếu report đã tồn tại theo sessionId
                Report existingReport = await _reportRepository.GetReportBySessionIdAsync(Guid.Parse(sessionId));

                if (existingReport != null)
                {
                    // Nếu đã tồn tại, cập nhật thông tin
                    existingReport.AnalysisData = result;
                    existingReport.GeneratedAt = DateTime.UtcNow;
                    existingReport.GeneratedBy = Guid.Parse(generateBy);
                    existingReport.Status = 1;

                    await _reportRepository.UpdateAsync(existingReport);

                    return Ok("Cập nhật dữ liệu thành công, dữ liệu phân tích là: " + result);
                }
                else
                {
                    // Nếu chưa có, tạo mới report
                    Report newReport = new Report()
                    {
                        RecordId = record.RecordId,
                        AnalysisData = result,
                        GeneratedAt = DateTime.UtcNow,
                        GeneratedBy = Guid.Parse(generateBy),
                        SessionId = Guid.Parse(sessionId),
                        Status = 1
                    };

                    await _reportRepository.AddReport(newReport);

                    return Ok("Thêm dữ liệu thành công, dữ liệu phân tích là: " + result);
                }
            }

            else
            {
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
        }


        [HttpPost("GetReportBySessionIdUsingGeminiAi")]
        public async Task<ActionResult> GenerateReportBySessionId(string sessionId)
        {
            Report report = _reportRepository.GetReportsWithSessionClassAndGeneratedBySessionId(Guid.Parse(sessionId));

            if (report == null)
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
                //Console.WriteLine("FilePathTemp"+newFilePath);


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


        [HttpPost("GetReportByReportIdUsingGeminiAi")]
        public async Task<ActionResult> GenerateReportByReportId(string reportId)
        {
            Report report = _reportRepository.GetReportsWithSessionClassAndGeneratedByReportId(Guid.Parse(reportId));

            if (report == null)
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
                //Console.WriteLine("FilePathTemp"+newFilePath);


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

        //Cách 1:Đầu tiên là gọi hàm Analyze trên để phân tích video
        //Sau khi gọi hàm Analyze thành công thì sẽ có report được tạo ra trong DB
        // sau đó gọi 1 trong 2 hàm ( GenerateReportBySessionId hoặc GenerateReportByReportId) này để sinh báo cáo từ form có sẵn
        //chọn hàm nào tùy vào cách thiết kế FE của anh Chính




        [HttpPost("AnalyzeAndGenerateReport")]
        public async Task<IActionResult> AnalyzeAndGenerateReport(string sessionId, string generateBy)
        {
            client.Timeout = TimeSpan.FromMinutes(20);

            var recordDir = Path.Combine(Directory.GetCurrentDirectory(), "Files", sessionId, "record");
            if (!Directory.Exists(recordDir))
            {
                return NotFound("Record directory not found.");
            }

            // Tìm file video
            var supportedExtensions = new[] { ".mp4", ".webm", ".mov", ".avi", ".mkv" };
            var videoFile = Directory.GetFiles(recordDir)
                                     .FirstOrDefault(f => supportedExtensions.Contains(Path.GetExtension(f).ToLower()));
            if (videoFile == null)
            {
                return NotFound("Video file not found.");
            }

            Console.WriteLine("Using video file: " + videoFile);

            // Chuẩn bị dữ liệu gửi đi
            var fileBytes = await System.IO.File.ReadAllBytesAsync(videoFile);
            var byteArrayContent = new ByteArrayContent(fileBytes);
            string extension = Path.GetExtension(videoFile).ToLower();
            string mimeType = extension switch
            {
                ".mp4" => "video/mp4",
                ".webm" => "video/webm",
                ".mov" => "video/quicktime",
                ".avi" => "video/x-msvideo",
                ".mkv" => "video/x-matroska",
                _ => "application/octet-stream"
            };
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            var multipartFormDataContent = new MultipartFormDataContent();
            multipartFormDataContent.Add(byteArrayContent, "video", Path.GetFileName(videoFile));

            // Gửi tới API phân tích
            var apiResponse = await client.PostAsync(Apianalyze, multipartFormDataContent);

            if (!apiResponse.IsSuccessStatusCode)
            {
                return StatusCode((int)apiResponse.StatusCode, await apiResponse.Content.ReadAsStringAsync());
            }

            // Xử lý kết quả
            var result = await apiResponse.Content.ReadAsStringAsync();
            var record = await _recordRepository.GetRecordBySessionAsync(Guid.Parse(sessionId));

            // Kiểm tra và thêm/cập nhật Report
            var report = await _reportRepository.GetReportBySessionIdAsync(Guid.Parse(sessionId));
            if (report != null)
            {
                report.AnalysisData = result;
                report.GeneratedAt = DateTime.UtcNow;
                report.GeneratedBy = Guid.Parse(generateBy);
                report.Status = 1;

                await _reportRepository.UpdateAsync(report);
            }
            else
            {
                report = new Report()
                {
                    RecordId = record.RecordId,
                    AnalysisData = result,
                    GeneratedAt = DateTime.UtcNow,
                    GeneratedBy = Guid.Parse(generateBy),
                    SessionId = Guid.Parse(sessionId),
                    Status = 1
                };

                await _reportRepository.AddReport(report);
            }

            // Lấy lại report có navigation đầy đủ để dùng cho sinh báo cáo
            var fullReport = _reportRepository.GetReportsWithSessionClassAndGeneratedBySessionId(report.SessionId);
            if (fullReport == null)
            {
                return NotFound("Chưa phân tích dữ liệu.");
            }

            try
            {
                var apiKey = "AIzaSyCKcdUoSFX8-9s5wNd4Bin94jQrUkbwrqo";
                var prompt = "Hãy phân tích bầu không khí lớp học dựa vào kết quả nhận diện cảm xúc như sau. Bao gồm các yếu tố:" +
                             "Mức độ tham gia của học sinh (dựa trên sự hiện diện)." +
                             "Trạng thái cảm xúc chiếm ưu thế." +
                             "Nhận xét chung về bầu không khí lớp học (Hào hứng sôi nổi/bình thường/trầm)." +
                             "Gợi ý cải thiện (nếu có) để nâng cao bầu không khí lớp học vui vẻ hơn.Đây là kết quả nhận diện: " + fullReport.AnalysisData;

                var googleAI = new GoogleAI(apiKey: apiKey);
                var model = googleAI.GenerativeModel(model: Model.Gemini15Pro);
                var analysisResponse = await model.GenerateContent(prompt);

                var today = DateTime.Now;
                string formattedDate = $"Hà Nội, ngày {today.Day} tháng {today.Month} năm {today.Year}";

                string basePath = AppContext.BaseDirectory;
                string templatePath = Path.Combine(basePath, "Meeting_Document_Report_template.docx");

                string tempDirectory = Path.GetTempPath();
                string newFilePath = Path.Combine(tempDirectory, $"Report_{DateTime.Now:yyyyMMddHHmmss}.docx");

                System.IO.File.Copy(templatePath, newFilePath, true);

                using (var doc = DocX.Load(newFilePath))
                {
                    doc.ReplaceText("{date}", formattedDate);
                    doc.ReplaceText("{class_name}", fullReport.Session.Class.ClassName);
                    doc.ReplaceText("{session_date}", fullReport.Session.SessionDate.ToString("dd/MM/yyyy"));
                    doc.ReplaceText("{slot}", fullReport.Session.Slot.ToString());
                    doc.ReplaceText("{analysis_result}", analysisResponse.Text.Trim());
                    doc.ReplaceText("{analyzer_name}", fullReport.GeneratedByNavigation.FullName);

                    foreach (var paragraph in doc.Paragraphs)
                    {
                        paragraph.Font(new Xceed.Document.NET.Font("Times New Roman"));
                    }

                    doc.Save();
                }

                var generatedBytes = System.IO.File.ReadAllBytes(newFilePath);
                var generatedFileName = Path.GetFileName(newFilePath);
                System.IO.File.Delete(newFilePath);

                return File(generatedBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", generatedFileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //Cách 2: Gọi hàm này để phân tích video và sinh báo cáo cùng 1 lúc.nhược điểm là mỗi lần muốn lấy report thì lại phải đợi phân tích lại từ đầu,Tiến không khuyến khích dùng cách này


    }
}
