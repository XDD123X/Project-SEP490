﻿using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class SessionChangeRequest
{
    public Guid RequestChangeId { get; set; }

    public Guid SessionId { get; set; }

    public Guid LecturerId { get; set; }

    public Guid? ApprovedBy { get; set; }

    public string? Description { get; set; }

    public DateTime? ApprovedDate { get; set; }

    public int? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Account? ApprovedByNavigation { get; set; }

    public virtual Account Lecturer { get; set; } = null!;

    public virtual Session Session { get; set; } = null!;
}
