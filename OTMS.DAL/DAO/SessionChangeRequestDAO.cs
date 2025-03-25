using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL;

namespace OTMS.DAL.DAO
{
    public class SessionChangeRequestDAO : GenericDAO<SessionChangeRequest>
    {
        private new readonly OtmsContext _context;

        public SessionChangeRequestDAO(OtmsContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SessionChangeRequest>> GetAllRequestsAsync()
        {
            return await _context.SessionChangeRequests
                .Include(r => r.Lecturer)
                .Include(r => r.ApprovedByNavigation)
                .Include(r => r.Session)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<SessionChangeRequest?> GetRequestByIdAsync(Guid requestChangeId)
        {
            return await _context.SessionChangeRequests
                .Include(r => r.Lecturer)
                .Include(r => r.ApprovedByNavigation)
                .Include(r => r.Session)
                .FirstOrDefaultAsync(r => r.RequestChangeId == requestChangeId);
        }

        /// <summary>
        /// Kiểm tra xem ngày và slot mới có bị trùng lịch không
        /// </summary>
        public async Task<(bool isConflict, string message)> CheckScheduleConflictAsync(Guid lecturerId, DateTime newDate, int newSlot, Guid? excludeSessionId = null)
        {
            // Kiểm tra trùng lịch với các buổi học khác của giảng viên
            var hasLecturerConflict = await _context.Sessions
                .AnyAsync(s => 
                    s.LecturerId == lecturerId && 
                    s.SessionDate.Date == newDate.Date && 
                    s.Slot == newSlot &&
                    (excludeSessionId == null || s.SessionId != excludeSessionId));

            if (hasLecturerConflict)
            {
                return (true, "Giảng viên đã có lịch dạy vào thời gian này.");
            }

            // Kiểm tra xem đã có yêu cầu thay đổi nào cho thời gian này chưa (chưa được duyệt)
            var hasPendingRequest = await _context.SessionChangeRequests
                .AnyAsync(r => 
                    r.LecturerId == lecturerId && 
                    r.NewDate == DateOnly.FromDateTime(newDate) && 
                    r.NewSlot == newSlot && 
                    r.Status == 0);

            if (hasPendingRequest)
            {
                return (true, "Đã có yêu cầu thay đổi sang thời gian này đang chờ duyệt.");
            }

            return (false, "");
        }

        /// <summary>
        /// Thêm yêu cầu thay đổi lịch mới
        /// </summary>
        public async Task<(bool isSuccess, string message)> AddRequestAsync(AddSessionChangeRequestDTO model)
        {
            // Lấy thông tin buổi học hiện tại
            var session = await _context.Sessions
                .FirstOrDefaultAsync(s => s.SessionId == model.SessionId);

            if (session == null)
            {
                return (false, "Không tìm thấy buổi học.");
            }

            // Kiểm tra xem buổi học có phải của giảng viên này không
            if (session.LecturerId != model.LecturerId)
            {
                return (false, "Giảng viên không phụ trách buổi học này.");
            }

            // Kiểm tra xem đã có yêu cầu thay đổi nào cho buổi học này chưa (chưa được duyệt)
            var hasPendingRequest = await _context.SessionChangeRequests
                .AnyAsync(r => r.SessionId == model.SessionId && r.Status == 0);

            if (hasPendingRequest)
            {
                return (false, "Đã có yêu cầu thay đổi cho buổi học này đang chờ duyệt.");
            }

            // Kiểm tra trùng lịch
            var (isConflict, conflictMessage) = await CheckScheduleConflictAsync(
                model.LecturerId, 
                model.NewDate, 
                model.NewSlot, 
                model.SessionId);

            if (isConflict)
            {
                return (false, conflictMessage);
            }

            // Tạo yêu cầu thay đổi mới
            var request = new SessionChangeRequest
            {
                RequestChangeId = Guid.NewGuid(),
                SessionId = model.SessionId,
                LecturerId = model.LecturerId,
                Description = model.Description,
                CreatedAt = DateTime.Now,
                Status = 0,
                NewDate = DateOnly.FromDateTime(model.NewDate),
                NewSlot = model.NewSlot,
                OldDate = DateOnly.FromDateTime(session.SessionDate),
                OldSlot = session.Slot
            };

            await _context.SessionChangeRequests.AddAsync(request);
            await _context.SaveChangesAsync();

            return (true, "Yêu cầu đổi lịch đã được gửi.");
        }

        /// <summary>
        /// Cập nhật trạng thái yêu cầu thay đổi lịch
        /// </summary>
        public async Task<(bool isSuccess, string message)> UpdateRequestAsync(UpdateSessionChangeRequestDTO model)
        {
            var request = await _context.SessionChangeRequests
                .Include(r => r.Session)
                .FirstOrDefaultAsync(r => r.RequestChangeId == model.RequestChangeId);

            if (request == null)
            {
                return (false, "Không tìm thấy yêu cầu thay đổi lịch.");
            }

            // Chỉ cho phép cập nhật những yêu cầu chưa được duyệt
            if (request.Status != 0)
            {
                return (false, "Yêu cầu này đã được xử lý.");
            }

            // Cập nhật trạng thái yêu cầu
            request.Status = model.Status;
            request.ApprovedBy = model.ApprovedBy;
            request.ApprovedDate = DateTime.Now;

            // Nếu yêu cầu được duyệt, cập nhật buổi học
            if (model.Status == 1)
            {
                // Cập nhật buổi học
                var session = request.Session;
                session.SessionDate = request.NewDate.ToDateTime(TimeOnly.MinValue);
                session.Slot = request.NewSlot;
                session.UpdatedAt = DateTime.Now;
                
                _context.Sessions.Update(session);
            }

            _context.SessionChangeRequests.Update(request);
            await _context.SaveChangesAsync();

            string resultMessage = model.Status switch
            {
                1 => "Yêu cầu đổi lịch đã được duyệt.",
                2 => "Yêu cầu đổi lịch đã bị từ chối.",
                _ => "Yêu cầu đổi lịch đã được cập nhật."
            };

            return (true, resultMessage);
        }

        /// <summary>
        /// Lấy danh sách yêu cầu thay đổi lịch của giảng viên
        /// </summary>
        public async Task<IEnumerable<SessionChangeRequest>> GetRequestsByLecturerIdAsync(Guid lecturerId)
        {
            return await _context.SessionChangeRequests
                .Include(r => r.Session)
                .Include(r => r.ApprovedByNavigation)
                .Where(r => r.LecturerId == lecturerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách yêu cầu thay đổi lịch chưa được duyệt
        /// </summary>
        public async Task<IEnumerable<SessionChangeRequest>> GetPendingRequestsAsync()
        {
            return await _context.SessionChangeRequests
                .Include(r => r.Session)
                .Include(r => r.Lecturer)
                .Where(r => r.Status == 0)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}
