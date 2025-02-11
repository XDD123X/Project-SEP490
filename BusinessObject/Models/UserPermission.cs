using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class UserPermission
{
    public int UserPermissionId { get; set; }

    public Guid AccountId { get; set; }

    public Guid PermissionId { get; set; }

    public DateTime? AssignedAt { get; set; }

    public int? Status { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Permission Permission { get; set; } = null!;
}
