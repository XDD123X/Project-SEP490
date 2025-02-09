﻿using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Attendance
{
    public int AttendanceId { get; set; }

    public int SessionId { get; set; }

    public int StudentId { get; set; }

    public string Status { get; set; } = null!;

    public string? ImgUrl { get; set; }

    public DateTime? AttendanceTime { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Session Session { get; set; } = null!;

    public virtual Account Student { get; set; } = null!;
}
