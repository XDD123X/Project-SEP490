using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class UserType
{
    public Guid UserTypeId { get; set; }

    public string UserTypeName { get; set; } = null!;

    public Guid RoleId { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
