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
        private readonly IReportRepository _reportRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IFileRepository _fileRepository;

        public FilesController(IRecordRepository recordRepository, IReportRepository reportRepository, ISessionRepository sessionRepository, IFileRepository fileRepository)
        {
            _recordRepository = recordRepository;
            _reportRepository = reportRepository;
            _sessionRepository = sessionRepository;
            _fileRepository = fileRepository;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
        {
            if (string.IsNullOrEmpty(request.SessionId) || string.IsNullOrEmpty(request.Type) || request.File == null || request.File.Length == 0)
                return BadRequest("Missing information or invalid file");

            // Lấy uid từ JWT
            var uid = User?.Claims?.FirstOrDefault(c => c.Type == "uid")?.Value;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized("User could not be identified");

            // Lấy thông tin session từ sessionRepository
            var session = await _sessionRepository.GetSessionsBySessionId(Guid.Parse(request.SessionId));
            if (session == null) return NotFound("Session not found");

            //Lấy ra thông tin class theo session
            var classInfor = session.Class;

            string filePath = string.Empty;
            string extension = Path.GetExtension(request.File.FileName);
            Guid newFileId = Guid.NewGuid(); // Dùng làm tên file
            string newFileName = newFileId + extension; // Tên file lưu trùng với fileId

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
                    Console.WriteLine($"Could not read video duration: {ex.Message}");
                }

                // Cập nhật sessionRecord cho session
                session.SessionRecord = DateTime.Now;
                await _sessionRepository.UpdateAsync(session);

                var record = new Record
                {
                    RecordId = newFileId, // Gán fileId làm RecordId
                    SessionId = Guid.Parse(request.SessionId),
                    Duration = videoDuration.ToString(),
                    VideoUrl = $"/files/{classInfor.ClassCode.Replace("/", "_")}/record/{session.SessionNumber}/{newFileName}",
                    Description = "Recording for session",
                    UploadedBy = Guid.Parse(uid),
                    CreatedAt = DateTime.Now,
                    Status = 1
                };

                await _recordRepository.AddAsync(record);
            }
            else if (request.Type.ToLower() == "file")
            {
                // Lấy đuôi file
                extension = Path.GetExtension(request.File.FileName);

                // Đường dẫn thư mục lưu file
                filePath = Path.Combine(Directory.GetCurrentDirectory(), "Files", classInfor.ClassCode.Replace("/", "_"), "files", session.SessionNumber.ToString());

                var fullFilePath = Path.Combine(filePath, newFileName);

                // Tạo thư mục nếu chưa có
                if (!Directory.Exists(filePath))
                    Directory.CreateDirectory(filePath);

                // Lưu file
                using (var stream = new FileStream(fullFilePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }

                // Lưu bản ghi DB
                var file = new File
                {
                    FileId = newFileId, // Gán fileId làm tên file vật lý
                    SessionId = Guid.Parse(request.SessionId),
                    FileName = Path.GetFileNameWithoutExtension(request.File.FileName),
                    FileUrl = $"/files/{classInfor.ClassCode.Replace("/", "_")}/files/{session.SessionNumber}/{newFileName}",
                    FileSize = request.File.Length.ToString(),
                    Description = "Uploaded file for session",
                    UploadedBy = Guid.Parse(uid),
                    CreatedAt = DateTime.Now,
                    Status = 1
                };

                await _fileRepository.AddAsync(file);
            }
            else
            {
                return BadRequest("Invalid file type");
            }

            return Ok(new
            {
                fileId = newFileId,
                sessionId = request.SessionId,
                type = request.Type,
                url = $"/files/{classInfor.ClassCode.Replace("/", "_")}/{request.Type}/{session.SessionNumber}/{newFileName}"
            });
        }


        [HttpGet("{fileId}")]
        public async Task<IActionResult> GetFile(Guid fileId)
        {
            // Tìm file trong database theo fileId
            var file = await _fileRepository.GetByIdAsync(fileId);
            if (file == null)
                return NotFound("File not found");

            // Tách tên file vật lý từ đường dẫn URL lưu trong DB
            var physicalFileName = Path.GetFileName(new Uri(file.FileUrl, UriKind.RelativeOrAbsolute).LocalPath);

            // Xây dựng đường dẫn vật lý đến file
            var relativePath = file.FileUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), relativePath);

            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found on disk");

            var mimeType = GetMimeType(physicalFileName);
            return PhysicalFile(filePath, mimeType, physicalFileName);
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
                return NotFound("Record not found in database.");

            // Lấy đường dẫn vật lý từ VideoUrl
            var relativePath = recordEntity.VideoUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
            var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), relativePath);

            // Xoá file vật lý nếu tồn tại
            if (System.IO.File.Exists(physicalPath))
            {
                System.IO.File.Delete(physicalPath);
            }

            // Xoá report liên quan nếu tồn tại
            var reportByRecordId = await _reportRepository.GetReportBySessionIdAsync(recordEntity.SessionId);
            if (reportByRecordId != null)
            {
                await _reportRepository.DeleteAsync(reportByRecordId.ReportId);
            }

            // Xoá record khỏi DB
            await _recordRepository.DeleteAsync(recordId);

            // Xoá thời gian record trong session liên quan (nếu có)
            var session = await _sessionRepository.GetByIdAsync(recordEntity.SessionId);
            if (session != null)
            {
                session.SessionRecord = null;
                await _sessionRepository.UpdateAsync(session);
            }

            return Ok("Record deleted successfully.");
        }

        [HttpDelete("file/{fileId}")]
        public async Task<IActionResult> DeleteFile(Guid fileId)
        {
            // Lấy file từ DB theo fileId
            var fileEntity = await _fileRepository.GetByIdAsync(fileId);
            if (fileEntity == null)
                return NotFound("File not found in database.");

            // Lấy đường dẫn vật lý từ FileUrl
            var relativePath = fileEntity.FileUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
            var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), relativePath);

            // Xoá file vật lý nếu tồn tại
            if (System.IO.File.Exists(physicalPath))
            {
                System.IO.File.Delete(physicalPath);
            }

            // Xoá bản ghi trong DB
            await _fileRepository.DeleteAsync(fileId);

            return Ok("File deleted successfully.");
        }

        [HttpPut("file/{fileId}")]
        public async Task<IActionResult> UpdateFile(Guid fileId, [FromBody] UpdateFileRequest request)
        {
            // Kiểm tra tồn tại file
            var fileEntity = await _fileRepository.GetByIdAsync(fileId);
            if (fileEntity == null)
                return NotFound("File Not Found.");

            fileEntity.FileName = request.FileName.Trim();
            fileEntity.Description = request.Description;
            fileEntity.UpdatedAt = DateTime.Now;

            await _fileRepository.UpdateAsync(fileEntity);

            return Ok("File Updated Successfully.");
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
