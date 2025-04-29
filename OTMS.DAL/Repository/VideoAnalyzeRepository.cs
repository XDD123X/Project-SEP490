using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Azure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Mscc.GenerativeAI;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

namespace OTMS.DAL.Repository
{
    public class VideoAnalyzeRepository : IVideoAnalyze
    {
        private readonly ILogger<VideoAnalyzeRepository> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public VideoAnalyzeRepository(ILogger<VideoAnalyzeRepository> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        public async Task AnalyzeVideoAsync(Guid sessionId, Guid generateBy)
        {
            Console.WriteLine("Bắt đầu phân tích video");
            using var scope = _scopeFactory.CreateScope();

            var sessionRepo = scope.ServiceProvider.GetRequiredService<ISessionRepository>();
            var recordRepo = scope.ServiceProvider.GetRequiredService<IRecordRepository>();
            var reportRepo = scope.ServiceProvider.GetRequiredService<IReportRepository>();

            var report = await reportRepo.GetReportBySessionIdAsync(sessionId);
            var session = await sessionRepo.GetSessionsBySessionId(sessionId);
            var record = await recordRepo.GetRecordBySessionAsync(sessionId);

            if (record == null)
            {
                Console.WriteLine("Session không có record để phân tích");
                return;
            }

            if (report == null)
            {
                Console.WriteLine("Không tìm thấy report để cập nhật!");
                return;
            }

            // Cập nhật lại thông tin người generate (cho chắc)
            report.GeneratedAt = DateTime.UtcNow;
            report.GeneratedBy = generateBy;
            await reportRepo.UpdateAsync(report);

            try
            {
                var recordDir = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Files",
                    session.Class.ClassCode.Replace("/", "_"),
                    "record",
                    session.SessionNumber.ToString());

                var videoFile = Directory.GetFiles(recordDir)
                    .FirstOrDefault(f => new[] { ".mp4", ".webm", ".mov", ".avi", ".mkv" }
                    .Contains(Path.GetExtension(f).ToLower()));

                if (videoFile == null)
                {
                    Console.WriteLine($"Không tìm thấy video để phân tích cho session {sessionId}");
                    report.Status = -1;
                    await reportRepo.UpdateAsync(report);
                    return;
                }

                // ===== Upload Video =====
                string analysisResult = null;
                try
                {
                    var client = new HttpClient { Timeout = TimeSpan.FromMinutes(20) };
                    var fileBytes = await System.IO.File.ReadAllBytesAsync(videoFile);

                    var content = new MultipartFormDataContent
            {
                {
                    new ByteArrayContent(fileBytes)
                    {
                        Headers = { ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("video/mp4") }
                    },
                    "video",
                    Path.GetFileName(videoFile)
                }
            };

                    Console.WriteLine("Gửi video đến API phân tích...");
                    var response = await client.PostAsync("http://127.0.0.1:4000/upload_video", content);

                    if (!response.IsSuccessStatusCode)
                    {
                        Console.WriteLine($"Upload video thất bại với mã {response.StatusCode}");
                        report.Status = -1;
                        await reportRepo.UpdateAsync(report);
                        return;
                    }

                    analysisResult = await response.Content.ReadAsStringAsync();
                    Console.WriteLine("Upload video thành công và nhận kết quả.");
                }
                catch (Exception exUpload)
                {
                    Console.WriteLine($"Lỗi upload video: {exUpload.Message}");
                    report.Status = -1;
                    await reportRepo.UpdateAsync(report);
                    return;
                }

                // ===== Gọi Gemini AI =====
                try
                {
                    Console.WriteLine("Gọi Google Gemini để phân tích nội dung...");

                    var apiKey = "AIzaSyCKcdUoSFX8-9s5wNd4Bin94jQrUkbwrqo";
                    var prompt = $@"Dựa vào dữ liệu nhận diện cảm xúc sau:
{analysisResult}

Hãy phân tích và đánh giá bầu không khí trong lớp học theo các tiêu chí sau:

1. Số lượng học sinh đã được nhận diện, kèm theo tên của từng bạn.
2. Đánh giá mức độ tham gia của từng học sinh dựa trên chỉ số 'presence_ratio':
   - Nếu 'presence_ratio' >= 0.8: Ghi nhận là học sinh có sự tập trung cao.
   - Nếu 'presence_ratio' từ 0.4 đến dưới 0.8: Ghi nhận là học sinh tham gia ở mức trung bình.
   - Nếu 'presence_ratio' < 0.4: Ghi nhận là học sinh đang thiếu tập trung.
3. Xác định trạng thái cảm xúc chiếm ưu thế nhất trong lớp học (vui vẻ, buồn bã, lo lắng, v.v.).
4. Đưa ra nhận xét tổng quan về bầu không khí lớp học với các mức: 'Hào hứng sôi nổi', 'Bình thường', hoặc 'Trầm lắng'.
5. Nếu bầu không khí chưa tích cực, hãy đưa ra gợi ý cụ thể để cải thiện (ví dụ: thêm hoạt động nhóm, nghỉ giải lao, trò chuyện với học sinh, v.v.).

Trình bày phân tích rõ ràng, có cấu trúc, dễ hiểu.";


                    var googleAI = new GoogleAI(apiKey: apiKey);
                    var model = googleAI.GenerativeModel(model: Model.Gemini15Pro);
                    var geminiResponse = await model.GenerateContent(prompt);

                    report.AnalysisData = analysisResult;
                    report.GeminiResponse = geminiResponse.Text.Trim();
                }
                catch (Exception exGemini)
                {
                    Console.WriteLine($"Lỗi khi gọi Google Gemini: {exGemini.Message}");
                    report.Status = -1;
                    await reportRepo.UpdateAsync(report);
                    return;
                }

                report.Status = 2; // Phân tích hoàn tất
                await reportRepo.UpdateAsync(report);
                Console.WriteLine("Phân tích video hoàn tất.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi tổng quát khi phân tích session {sessionId}: {ex.Message}");
                report.Status = -1;
                await reportRepo.UpdateAsync(report);
            }
        }


        //public async Task AnalyzeVideoAsync(Guid sessionId, Guid generateBy)
        //{
        //    Console.WriteLine("Bắt đầu phân tích video");
        //    using var scope = _scopeFactory.CreateScope();

        //    var sessionRepo = scope.ServiceProvider.GetRequiredService<ISessionRepository>();
        //    var recordRepo = scope.ServiceProvider.GetRequiredService<IRecordRepository>();
        //    var reportRepo = scope.ServiceProvider.GetRequiredService<IReportRepository>();

        //    var report = await reportRepo.GetReportBySessionIdAsync(sessionId);
        //    var session = await sessionRepo.GetSessionsBySessionId(sessionId);
        //    var record = await recordRepo.GetRecordBySessionAsync(sessionId);

        //    if (record == null)
        //    {
        //        Console.WriteLine("Session không có record để phân tích");
        //        return;
        //    }

        //    if (report != null)
        //    {
        //        report.GeneratedAt = DateTime.UtcNow;
        //        report.GeneratedBy = generateBy;
        //        await reportRepo.UpdateAsync(report);
        //    }
        //    else
        //    {
        //        report = new Report
        //        {
        //            RecordId = record.RecordId,
        //            GeneratedAt = DateTime.UtcNow,
        //            GeneratedBy = generateBy,
        //            SessionId = sessionId,
        //            Status = 1,
        //        };
        //        await reportRepo.AddReport(report);
        //    }

        //    try
        //    {
        //        var recordDir = Path.Combine(
        //            Directory.GetCurrentDirectory(),
        //            "Files",
        //            session.Class.ClassCode.Replace("/", "_"),
        //            "record",
        //            session.SessionNumber.ToString());

        //        var videoFile = Directory.GetFiles(recordDir)
        //            .FirstOrDefault(f => new[] { ".mp4", ".webm", ".mov", ".avi", ".mkv" }
        //            .Contains(Path.GetExtension(f).ToLower()));

        //        if (videoFile == null)
        //        {
        //            Console.WriteLine($"Không tìm thấy video để phân tích cho session {sessionId}");
        //            report.Status = -1;
        //            await reportRepo.UpdateAsync(report);
        //            return;
        //        }

        //        // ===== Upload Video =====
        //        string analysisResult = null;
        //        try
        //        {
        //            var client = new HttpClient { Timeout = TimeSpan.FromMinutes(20) };
        //            var fileBytes = await System.IO.File.ReadAllBytesAsync(videoFile);

        //            var content = new MultipartFormDataContent
        //    {
        //        {
        //            new ByteArrayContent(fileBytes)
        //            {
        //                Headers = { ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("video/mp4") }
        //            },
        //            "video",
        //            Path.GetFileName(videoFile)
        //        }
        //    };

        //            Console.WriteLine("Gửi video đến API phân tích...");
        //            var response = await client.PostAsync("http://127.0.0.1:4000/upload_video", content);

        //            if (!response.IsSuccessStatusCode)
        //            {
        //                Console.WriteLine($"Upload video thất bại với mã {response.StatusCode}");
        //                report.Status = -1;
        //                await reportRepo.UpdateAsync(report);
        //                return;
        //            }

        //            analysisResult = await response.Content.ReadAsStringAsync();
        //            Console.WriteLine("Upload video thành công và nhận kết quả.");
        //        }
        //        catch (Exception exUpload)
        //        {
        //            Console.WriteLine($"Lỗi upload video: {exUpload.Message}");
        //            report.Status = -1;
        //            await reportRepo.UpdateAsync(report);
        //            return;
        //        }

        //        // ===== Gọi Gemini AI =====
        //        try
        //        {
        //            Console.WriteLine("Gọi Google Gemini để phân tích nội dung...");

        //            var apiKey = "AIzaSyCKcdUoSFX8-9s5wNd4Bin94jQrUkbwrqo";
        //            var prompt = $@"Hãy đưa ra thông tin và phân tích bầu không khí lớp học dựa vào kết quả nhận diện cảm xúc sau:
        //                            {analysisResult}
        //                            Bao gồm các yếu tố:
        //                            - Có bao nhiêu học sinh đã nhận diện được?
        //                            - Mức độ tham gia của học sinh (dựa trên sự hiện diện).
        //                            - Trạng thái cảm xúc chiếm ưu thế.
        //                            - Nhận xét chung về bầu không khí lớp học (Hào hứng sôi nổi / Bình thường / Trầm lắng).
        //                            - Gợi ý cải thiện bầu không khí nếu có.";

        //            var googleAI = new GoogleAI(apiKey: apiKey);
        //            var model = googleAI.GenerativeModel(model: Model.Gemini15Pro);
        //            var geminiResponse = await model.GenerateContent(prompt);

        //            // Save cả AnalysisData và Gemini Response
        //            report.AnalysisData = analysisResult;
        //            report.GeminiResponse = geminiResponse.Text.Trim();
        //        }
        //        catch (Exception exGemini)
        //        {
        //            Console.WriteLine($"Lỗi khi gọi Google Gemini: {exGemini.Message}");
        //            report.Status = -1;
        //            await reportRepo.UpdateAsync(report);
        //            return;
        //        }

        //        report.Status = 2;
        //        await reportRepo.UpdateAsync(report);
        //        Console.WriteLine("Phân tích video hoàn tất.");
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Lỗi tổng quát khi phân tích session {sessionId}: {ex.Message}");
        //        report.Status = -1;
        //        await reportRepo.UpdateAsync(report);
        //    }
        //}




    }
}

