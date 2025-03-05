using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class LecturerSchedule
{
    public Guid ScheduleId { get; set; }

    public Guid LecturerId { get; set; }

    public string? SlotAvailable { get; set; }

    public string? WeekdayAvailable { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Account Lecturer { get; set; } = null!;
}
