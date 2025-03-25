using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class ProfileChangeRequest
{
    public Guid RequestChangeId { get; set; }

    public Guid AccountId { get; set; }

    public string ImgUrlOld { get; set; } = null!;

    public string ImgUrlNew { get; set; } = null!;

    public Guid? ApprovedBy { get; set; }

    public string? Description { get; set; }

    public DateTime? ApprovedDate { get; set; }

    public int? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Account? ApprovedByNavigation { get; set; }
}
