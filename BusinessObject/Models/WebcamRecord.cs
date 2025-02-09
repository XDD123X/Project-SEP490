using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class WebcamRecord
{
    public int WebcamRecordId { get; set; }

    public int SessionId { get; set; }

    public int StudentId { get; set; }

    public string? VideoUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Session Session { get; set; } = null!;

    public virtual Account Student { get; set; } = null!;
}
