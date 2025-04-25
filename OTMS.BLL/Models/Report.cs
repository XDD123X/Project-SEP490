using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Report
{
    public Guid ReportId { get; set; }

    public Guid RecordId { get; set; }

    public Guid SessionId { get; set; }

    //public string AnalysisData { get; set; } = null!;

    public string? AnalysisData { get; set; }  // Cho phép null


    public DateTime? GeneratedAt { get; set; }

    public Guid? GeneratedBy { get; set; }

    public string? GeminiResponse { get; set; }

    public int? Status { get; set; }

    public virtual Account? GeneratedByNavigation { get; set; }

    public virtual Record Record { get; set; } = null!;

    public virtual Session Session { get; set; } = null!;
}
