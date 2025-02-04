using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Attendance
{
    public Guid AttendanceId { get; set; }

    public Guid ScheduleId { get; set; }

    public Guid StudentId { get; set; }

    public string AttendanceStatus { get; set; } = null!;

    public string? ImgUrl { get; set; }

    public DateTime? AttendanceTime { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Schedule Schedule { get; set; } = null!;

    public virtual User Student { get; set; } = null!;
}
