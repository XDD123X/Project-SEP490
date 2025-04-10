using MediaToolkit.Model;
using MediaToolkit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Material_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Files");
        private readonly IRecordRepository _recordRepository;



        public FilesController(IRecordRepository recordRepositoyry)
        {
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
            _recordRepository = recordRepositoyry;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
        {
            if (string.IsNullOrEmpty(request.SessionId) || string.IsNullOrEmpty(request.Type) || request.File == null || request.File.Length == 0)
                return BadRequest("Thiếu thông tin hoặc file không hợp lệ");

            var savePath = Path.Combine(Directory.GetCurrentDirectory(), "Files", request.SessionId, request.Type);
            if (!Directory.Exists(savePath))
                Directory.CreateDirectory(savePath);

            // Lấy phần mở rộng (đuôi) của file gốc
            var fileExtension = Path.GetExtension(request.File.FileName);

            // Tạo tên file mới theo định dạng yêu cầu
            var newFileName = $"{request.Type}_{request.SessionId}{fileExtension}";

            var filePath = Path.Combine(savePath, newFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            // Lấy uid từ JWT
            var uid = User?.Claims?.FirstOrDefault(c => c.Type == "uid")?.Value;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized("Không thể xác định người dùng");

            if (request.Type.ToLower() == "record")
            {
                //video duration
                TimeSpan videoDuration = TimeSpan.Zero;
                try
                {
                    using (var engine = new Engine()) // Engine từ MediaToolkit
                    {
                        var inputFile = new MediaFile { Filename = filePath };
                        engine.GetMetadata(inputFile);
                        videoDuration = inputFile.Metadata.Duration;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Không thể đọc thời lượng video: {ex.Message}");
                    // Nếu không đọc được, có thể đặt giá trị mặc định (ví dụ: 0 hoặc null)
                }


                var record = new Record
                {
                    RecordId = Guid.NewGuid(),
                    SessionId = Guid.Parse(request.SessionId),
                    Duration = videoDuration.ToString(),
                    VideoUrl = $"/files/{request.SessionId}/{request.Type}/{newFileName}",
                    Description = "Recording for session",
                    UploadedBy = Guid.Parse(uid),
                    CreatedAt = DateTime.UtcNow,
                    Status = 1
                };

                await _recordRepository.AddAsync(record); // Đảm bảo bạn đã inject _recordRepository
            }

            return Ok(new
            {
                fileName = newFileName,
                sessionId = request.SessionId,
                type = request.Type,
                url = $"/files/{request.SessionId}/{request.Type}/{newFileName}"
            });
        }

        [HttpGet("{fileName}")]
        public IActionResult GetFile(string fileName)
        {
            var filePath = Path.Combine(_uploadPath, fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var mimeType = GetMimeType(fileName);
            return PhysicalFile(filePath, mimeType, fileName);
        }

        [HttpDelete("{fileName}")]
        public IActionResult DeleteFile(string fileName)
        {
            var filePath = Path.Combine(_uploadPath, fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound();

            System.IO.File.Delete(filePath);

            return Ok("Đã xoá file");
        }

        private string GetMimeType(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".mp4" => "video/mp4",
                ".mov" => "video/quicktime",
                ".pdf" => "application/pdf",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _ => "application/octet-stream"
            };
        }
    }
}
