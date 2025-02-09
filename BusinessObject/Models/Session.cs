﻿using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Session
{
    public int SessionId { get; set; }

    public int ClassId { get; set; }

    public int LecturerId { get; set; }

    public DateTime SessionDate { get; set; }

    public int Slot { get; set; }

    public string? Description { get; set; }

    public DateOnly? SessionRecord { get; set; }

    public int? Type { get; set; }

    public int? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual Class Class { get; set; } = null!;

    public virtual Account Lecturer { get; set; } = null!;

    public virtual ICollection<SessionRecord> SessionRecords { get; set; } = new List<SessionRecord>();

    public virtual ICollection<WebcamRecord> WebcamRecords { get; set; } = new List<WebcamRecord>();
}
