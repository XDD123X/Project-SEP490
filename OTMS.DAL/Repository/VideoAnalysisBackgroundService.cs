using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OTMS.DAL.Interface;
using OTMS.BLL.Models;
using Microsoft.Extensions.DependencyInjection;
namespace OTMS.BLL.Services
{
    public class VideoAnalysisBackgroundService : BackgroundService
    {
        private readonly ILogger<VideoAnalysisBackgroundService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly Channel<(string SessionId, string GenerateBy)> _channel;

        public VideoAnalysisBackgroundService(
            ILogger<VideoAnalysisBackgroundService> logger,
            IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
            _channel = Channel.CreateUnbounded<(string, string)>();
        }

        public void QueueAnalysis(string sessionId, string generateBy)
        {
            _channel.Writer.TryWrite((sessionId, generateBy));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var (sessionId, generateBy) in _channel.Reader.ReadAllAsync(stoppingToken))
            {
                using var scope = _scopeFactory.CreateScope();
                var videoAnalyze = scope.ServiceProvider.GetRequiredService<IVideoAnalyze>();
                Console.WriteLine("Bắt đầu với "+sessionId);

                try
                {
                    await videoAnalyze.AnalyzeVideoAsync(Guid.Parse(sessionId),Guid.Parse( generateBy));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi phân tích video cho session {SessionId}", sessionId);
                }
            }
        }
    }
}
//namespace OTMS.BLL.Services
//{
//    public class VideoAnalysisBackgroundService : BackgroundService
//    {
//        private readonly ILogger<VideoAnalysisBackgroundService> _logger;
//        private readonly IServiceScopeFactory _scopeFactory;
//        private readonly Channel<(string SessionId, string GenerateBy)> _channel;

//        public VideoAnalysisBackgroundService(
//            ILogger<VideoAnalysisBackgroundService> logger,
//            IServiceScopeFactory scopeFactory)
//        {
//            _logger = logger;
//            _scopeFactory = scopeFactory;
//            _channel = Channel.CreateUnbounded<(string, string)>();
//        }

//        public void QueueAnalysis(string sessionId, string generateBy)
//        {
//            _channel.Writer.TryWrite((sessionId, generateBy));
//        }

//        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//        {
//            await foreach (var (sessionId, generateBy) in _channel.Reader.ReadAllAsync(stoppingToken))
//            {
//                using var scope = _scopeFactory.CreateScope();

//                var sessionRepo = scope.ServiceProvider.GetRequiredService<ISessionRepository>();
//                var recordRepo = scope.ServiceProvider.GetRequiredService<IRecordRepository>();
//                var reportRepo = scope.ServiceProvider.GetRequiredService<IReportRepository>();

//                try
//                {
//                    var sessionGuid = Guid.Parse(sessionId);
//                    var session = await sessionRepo.GetSessionsBySessionId(sessionGuid);
//                    var record = await recordRepo.GetRecordBySessionAsync(sessionGuid);

//                    // 🟡 Cập nhật trạng thái "đang phân tích"
//                    record.Status = 2;
//                    await recordRepo.UpdateAsync(record);

//                    var recordDir = Path.Combine(
//                        Directory.GetCurrentDirectory(),
//                        "Files",
//                        session.Class.ClassCode.Replace("/", "_"),
//                        "record",
//                        session.SessionNumber.ToString());

//                    var videoFile = Directory.GetFiles(recordDir).FirstOrDefault(f =>
//                        new[] { ".mp4", ".webm", ".mov", ".avi", ".mkv" }
//                            .Contains(Path.GetExtension(f).ToLower()));

//                    if (videoFile == null)
//                    {
//                        _logger.LogWarning("Không tìm thấy video để phân tích cho session {SessionId}", sessionId);
//                        continue;
//                    }

//                    var client = new HttpClient { Timeout = TimeSpan.FromMinutes(20) };
//                    var fileBytes = await System.IO.File.ReadAllBytesAsync(videoFile);

//                    var content = new MultipartFormDataContent
//                    {
//                        {
//                            new ByteArrayContent(fileBytes)
//                            {
//                                Headers = { ContentType = new MediaTypeHeaderValue("video/mp4") }
//                            },
//                            "video",
//                            Path.GetFileName(videoFile)
//                        }
//                    };

//                    var response = await client.PostAsync("http://127.0.0.1:4000/upload_video", content);

//                    if (response.IsSuccessStatusCode)
//                    {
//                        var result = await response.Content.ReadAsStringAsync();
//                        var report = await reportRepo.GetReportBySessionIdAsync(sessionGuid);

//                        if (report != null)
//                        {
//                            report.AnalysisData = result;
//                            report.GeneratedAt = DateTime.UtcNow;
//                            report.GeneratedBy = Guid.Parse(generateBy);
//                            report.Status = 1;

//                            await reportRepo.UpdateAsync(report);
//                        }
//                        else
//                        {
//                            await reportRepo.AddReport(new Report
//                            {
//                                RecordId = record.RecordId,
//                                AnalysisData = result,
//                                GeneratedAt = DateTime.UtcNow,
//                                GeneratedBy = Guid.Parse(generateBy),
//                                SessionId = sessionGuid,
//                                Status = 1
//                            });
//                        }

//                        // ✅ Cập nhật trạng thái "phân tích xong"
//                        record.Status = 3;
//                        await recordRepo.UpdateAsync(record);
//                    }
//                    else
//                    {
//                        _logger.LogError("Gọi API phân tích thất bại: {Status}", response.StatusCode);
//                    }
//                }
//                catch (Exception ex)
//                {
//                    _logger.LogError(ex, "Lỗi khi xử lý phân tích video cho session {SessionId}", sessionId);
//                }
//            }
//        }
//    }
//}
