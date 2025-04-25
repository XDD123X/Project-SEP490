using MediaToolkit.Model;
using MediaToolkit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;
using File = OTMS.BLL.Models.File;

namespace OTMS.API.Controllers.Material_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Files");
        private readonly IRecordRepository _recordRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IFileRepository _fileRepository;



        public FilesController(IRecordRepository recordRepositoyry, ISessionRepository sessionRepository, IFileRepository fileRepository)
        {
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
            _recordRepository = recordRepositoyry;
            _sessionRepository = sessionRepository;
            _fileRepository = fileRepository;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
        {
            if (string.IsNullOrEmpty(request.SessionId) || string.IsNullOrEmpty(request.Type) || request.File == null || request.File.Length == 0)
                return BadRequest("Thiếu thông tin hoặc file không hợp lệ");

            // Lấy uid từ JWT
            var uid = User?.Claims?.FirstOrDefault(c => c.Type == "uid")?.Value;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized("Không thể xác định người dùng");

            // Lấy thông tin session từ sessionRepository
            var session = await _sessionRepository.GetSessionsBySessionId(Guid.Parse(request.SessionId));
            if (session == null) return NotFound("Không tìm thấy lớp học");

            //Lấy ra thông tin class theo session
            var classInfor = session.Class;

            // Tạo đường dẫn lưu file
            string filePath = string.Empty;
            string newFileName = request.File.FileName;

            // Tạo một progress object để theo dõi tiến độ tải lên
            var progress = new Progress<int>(percent =>
            {
                // Gửi tiến độ tải lên về phía client
                Console.WriteLine($"Tiến độ tải lên: {percent}%");
            });


            if (request.Type.ToLower() == "record")
            {
                // Đường dẫn lưu record
                filePath = Path.Combine(Directory.GetCurrentDirectory(), "Files", classInfor.ClassCode.Replace("/", "_"), "record", session.SessionNumber.ToString());

                // Tạo đường dẫn và lưu file
                var fullFilePath = Path.Combine(filePath, newFileName);
                if (!Directory.Exists(filePath))
                    Directory.CreateDirectory(filePath);

                // Tải lên file và theo dõi tiến độ
                using (var stream = new FileStream(fullFilePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }
                // Tính toán thời gian video với MediaToolkit
                TimeSpan videoDuration = TimeSpan.Zero;
                try
                {
                    using (var engine = new Engine()) // Sử dụng MediaToolkit Engine
                    {
                        var inputFile = new MediaFile { Filename = fullFilePath };
                        engine.GetMetadata(inputFile); // Lấy metadata của video
                        videoDuration = inputFile.Metadata.Duration; // Lấy thời gian video
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Không thể đọc thời lượng video: {ex.Message}");
                }

                // Cập nhật sessionRecord cho session
                session.SessionRecord = DateTime.Now;
                await _sessionRepository.UpdateAsync(session);

                var record = new Record
                {
                    RecordId = Guid.NewGuid(),
                    SessionId = Guid.Parse(request.SessionId),
                    Duration = videoDuration.ToString(),  // Gán thời gian video vào record
                    VideoUrl = $"/files/{classInfor.ClassCode.Replace("/", "_")}/record/{session.SessionNumber}/{newFileName}",
                    Description = "Recording for session",
                    UploadedBy = Guid.Parse(User?.Claims?.FirstOrDefault(c => c.Type == "uid")?.Value),
                    CreatedAt = DateTime.Now,
                    Status = 1
                };

                await _recordRepository.AddAsync(record); // Đảm bảo bạn đã inject _recordRepository
            }
            else if (request.Type.ToLower() == "file")
            {
                // Đường dẫn lưu file
                filePath = Path.Combine(Directory.GetCurrentDirectory(), "Files", classInfor.ClassCode.Replace("/", "_"), "files", session.SessionNumber.ToString());

                // Tạo đường dẫn và lưu file
                var fullFilePath = Path.Combine(filePath, newFileName);
                if (!Directory.Exists(filePath))
                    Directory.CreateDirectory(filePath);

                // Tải lên file và theo dõi tiến độ
                using (var stream = new FileStream(fullFilePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }

                // Bổ sung trường vào bảng File
                var file = new File
                {
                    FileId = Guid.NewGuid(),
                    SessionId = Guid.Parse(request.SessionId),
                    FileName = newFileName,
                    FileUrl = $"/files/{classInfor.ClassCode.Replace("/", "_")}/files/{session.SessionNumber}/{newFileName}",
                    FileSize = request.File.Length.ToString(),  // Giữ lại dung lượng file
                    Description = "Uploaded file for session",
                    UploadedBy = Guid.Parse(User?.Claims?.FirstOrDefault(c => c.Type == "uid")?.Value),
                    CreatedAt = DateTime.Now,
                    Status = 1
                };

                await _fileRepository.AddAsync(file);
            }
            else
            {
                return BadRequest("Loại file không hợp lệ");
            }

            return Ok(new
            {
                fileName = newFileName,
                sessionId = request.SessionId,
                type = request.Type,
                url = $"/files/{classInfor.ClassCode}/{request.Type}/{session.SessionNumber}/{newFileName}"
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

        [HttpGet("download/{fileId}")]
        public async Task<IActionResult> DownloadFile(Guid fileId)
        {
            var file = await _fileRepository.GetByIdAsync(fileId);
            if (file == null)
                return NotFound("File không tồn tại.");

            // Đường dẫn vật lý trên server (file.FileUrl là dạng: /files/classCode/files/sessionNumber/filename.ext)
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), file.FileUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (!System.IO.File.Exists(filePath))
                return NotFound("File không tồn tại trên hệ thống.");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                await stream.CopyToAsync(memory);
            }

            memory.Position = 0;
            var contentType = GetContentType(filePath);
            var fileName = Path.GetFileName(filePath);

            return File(memory, contentType, fileName);
        }


        [HttpDelete("record/{recordId}")]
        public async Task<IActionResult> DeleteRecord(Guid recordId)
        {
            // Lấy record từ DB
            var recordEntity = await _recordRepository.GetByIdAsync(recordId);
            if (recordEntity == null)
                return NotFound("Không tìm thấy record trong cơ sở dữ liệu.");

            // Lấy tên file từ đường dẫn
            var recordName = Path.GetFileName(recordEntity.VideoUrl);
            var recordPath = Path.Combine(_uploadPath, recordName);

            Console.WriteLine("record name: " + recordName);
            Console.WriteLine("record path: " + recordPath);

            // Xoá file vật lý nếu tồn tại
            if (System.IO.File.Exists(recordPath))
            {
                System.IO.File.Delete(recordPath);
            }

            // Xoá record khỏi DB
            await _recordRepository.DeleteAsync(recordId);

            // Lấy session liên quan
            var session = await _sessionRepository.GetByIdAsync(recordEntity.SessionId);
            if (session != null)
            {
                session.SessionRecord = null;
                await _sessionRepository.UpdateAsync(session);
            }

            return Ok("Đã xoá record thành công.");
        }

        [HttpDelete("file/{fileId}")]
        public async Task<IActionResult> DeleteFile(Guid fileId)
        {
            // Lấy file từ DB theo fileId
            var fileEntity = await _fileRepository.GetByIdAsync(fileId);
            if (fileEntity == null)
                return NotFound("Không tìm thấy file trong cơ sở dữ liệu.");

            // Lấy tên file từ đường dẫn (nếu lưu cả path, ví dụ: /uploads/abc.pdf)
            var fileName = Path.GetFileName(fileEntity.FileUrl);
            var filePath = Path.Combine(_uploadPath, fileName);

            // Xoá file vật lý nếu tồn tại
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Xoá bản ghi trong DB
            await _fileRepository.DeleteAsync(fileId);

            return Ok("Đã xoá file thành công.");
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

        private string GetContentType(string path)
        {
            var types = new Dictionary<string, string>
            {
                { ".txt", "text/plain" },
                { ".pdf", "application/pdf" },
                { ".doc", "application/vnd.ms-word" },
                { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                { ".xls", "application/vnd.ms-excel" },
                { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
                { ".png", "image/png" },
                { ".jpg", "image/jpeg" },
                { ".jpeg", "image/jpeg" },
                { ".gif", "image/gif" },
                { ".csv", "text/csv" },
                { ".mp4", "video/mp4" },
                // Thêm nếu cần
            };

            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types.ContainsKey(ext) ? types[ext] : "application/octet-stream";
        }

    }
}
