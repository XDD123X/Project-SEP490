using System;
using System.ComponentModel.DataAnnotations;

namespace OTMS.BLL.DTOs
{
    public class SessionSingleDTO
    {
        [Required]
        public Guid ClassId { get; set; }

        [Required]
        public Guid LecturerId { get; set; }

        [Required]
        public DateTime SessionDate { get; set; }

        [Required]
        [Range(1, 4, ErrorMessage = "Slot phải có giá trị từ 1 đến 4")]
        public int Slot { get; set; }
    }
} 