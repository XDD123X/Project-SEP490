﻿using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class SessionRecord
{
    public Guid RecordId { get; set; }

    public Guid SessionId { get; set; }

    public string? VideoUrl { get; set; }

    public string? Description { get; set; }

    public string? UploadedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Session Session { get; set; } = null!;
}
