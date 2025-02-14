using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Role
{
    public Guid RoleId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
}
