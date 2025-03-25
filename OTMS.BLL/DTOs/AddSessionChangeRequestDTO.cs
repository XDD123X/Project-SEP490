using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
   public class AddSessionChangeRequestDTO
    {
        // Thông tin buổi học cần thay đổi
        public Guid SessionId { get; set; }
        
        // Thông tin giảng viên
        public Guid LecturerId { get; set; }
        
        // Thông tin thời gian mới
        public DateTime NewDate { get; set; }
        public int NewSlot { get; set; }
        
        // Lý do thay đổi
        public string? Description { get; set; }
    }
}
