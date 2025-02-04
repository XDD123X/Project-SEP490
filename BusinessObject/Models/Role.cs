using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Role
{
    public Guid RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<UserType> UserTypes { get; set; } = new List<UserType>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
