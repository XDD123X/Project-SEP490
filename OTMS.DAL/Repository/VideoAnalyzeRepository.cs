using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
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
            Console.WriteLine("Bắt đầu phân tích video  ");
            using var scope = _scopeFactory.CreateScope();

            var sessionRepo = scope.ServiceProvider.GetRequiredService<ISessionRepository>();
            var recordRepo = scope.ServiceProvider.GetRequiredService<IRecordRepository>();
            var reportRepo = scope.ServiceProvider.GetRequiredService<IReportRepository>();

            try
            {
                var session = await sessionRepo.GetSessionsBySessionId(sessionId);
                var record = await recordRepo.GetRecordBySessionAsync(sessionId);

                // 🟡 Cập nhật trạng thái "đang phân tích"
                record.Status = 2;
                await recordRepo.UpdateAsync(record);

                var recordDir = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Files",
                    session.Class.ClassCode.Replace("/", "_"),
                    "record",
                    session.SessionNumber.ToString());

                var videoFile = Directory.GetFiles(recordDir).FirstOrDefault(f =>
                    new[] { ".mp4", ".webm", ".mov", ".avi", ".mkv" }
                        .Contains(Path.GetExtension(f).ToLower()));

                if (videoFile == null)
                {
                    Console.WriteLine("Không tìm thấy video để phân tích cho session {SessionId}", sessionId);
                    return;
                }

                var client = new HttpClient { Timeout = TimeSpan.FromMinutes(20) };
                var fileBytes = await System.IO.File.ReadAllBytesAsync(videoFile);

                var content = new MultipartFormDataContent
            {
                {
                    new ByteArrayContent(fileBytes)
                    {
                        Headers = { ContentType = new MediaTypeHeaderValue("video/mp4") }
                    },
                    "video",
                    Path.GetFileName(videoFile)
                }
            };
                Console.WriteLine("bắt đầu truyền vào api phân tích video");

                var response = await client.PostAsync("http://127.0.0.1:4000/upload_video", content);
                Console.WriteLine("đã có response");

                if (response.IsSuccessStatusCode)
                {



                    var result = await response.Content.ReadAsStringAsync();
                    Report report = await reportRepo.GetReportBySessionIdAsync(sessionId);



                    var apiKey = "AIzaSyCKcdUoSFX8-9s5wNd4Bin94jQrUkbwrqo";
                    var prompt = "Hãy phân tích bầu không khí lớp học dựa vào kết quả nhận diện cảm xúc như sau. Bao gồm các yếu tố:" +
                        "Mức độ tham gia của học sinh (dựa trên sự hiện diện)." +
                        "Trạng thái cảm xúc chiếm ưu thế." +
                        "Nhận xét chung về bầu không khí lớp học (Hào hứng sôi nổi/bình thường/trầm)." +
                        "Gợi ý cải thiện (nếu có) để nâng cao bầu không khí lớp học vui vẻ hơn.Đây là kết quả nhận diện: " + result;

                    var googleAI = new GoogleAI(apiKey: apiKey);
                    var model = googleAI.GenerativeModel(model: Model.Gemini15Pro);
                    var GeminiResponse = await model.GenerateContent(prompt);





                    if (report != null)
                    {


                        report.AnalysisData = result;
                        report.GeneratedAt = DateTime.UtcNow;
                        report.GeneratedBy = generateBy;
                        report.Status = 1;
                        report.GeminiResponse = GeminiResponse.Text.Trim().ToString();

                        await reportRepo.UpdateAsync(report);
                    }
                    else
                    {


                     

                        await reportRepo.AddReport(new Report
                        {
                            RecordId = record.RecordId,
                            AnalysisData = result,
                            GeneratedAt = DateTime.UtcNow,
                            GeneratedBy = generateBy,
                            SessionId = sessionId,
                            Status = 1,
                            GeminiResponse = GeminiResponse.Text.Trim().ToString()

                        });
                    }

                    // ✅ Cập nhật trạng thái "phân tích xong"
                    record.Status = 3;
                    await recordRepo.UpdateAsync(record);
                }
                else
                {
                    _logger.LogError("Gọi API phân tích thất bại: {Status}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý phân tích video cho session {SessionId}", sessionId);
            }
        }
    }

}
