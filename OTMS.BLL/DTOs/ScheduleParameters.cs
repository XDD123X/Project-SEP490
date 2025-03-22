using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    /// <summary>
    /// Lưu trữ tất cả các tham số cần thiết cho việc lập lịch
    /// </summary>
    public class ScheduleParameters
    {
        // Thông tin cơ bản
        public Guid ClassId { get; set; }
        public Guid LecturerId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Số buổi học cần lập lịch
        public int TotalSessions { get; set; }
        public int SlotsPerDay { get; set; }
        
        // Số buổi tối đa mỗi tuần
        public int MaxSessionsPerWeek { get; set; }
        
        // Ngày hợp lệ (giao giữa ngày mong muốn học và ngày giảng viên có thể dạy)
        public List<DayOfWeek> ValidDays { get; set; } = new List<DayOfWeek>();
        
        // Slot giảng viên có thể dạy
        public List<int> AvailableSlots { get; set; } = new List<int>();
    }
} 