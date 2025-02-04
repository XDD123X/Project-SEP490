using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class User
{
    public Guid UserId { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public Guid RoleId { get; set; }

    public Guid UserTypeId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? IsActive { get; set; }

    public string? Token { get; set; }

    public DateTime? ResetTokenExpiresAt { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<SessionRecord> SessionRecords { get; set; } = new List<SessionRecord>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual UserType UserType { get; set; } = null!;
}
