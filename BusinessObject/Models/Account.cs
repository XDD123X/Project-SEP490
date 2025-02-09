using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Account
{
    public int AccountId { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public int RoleId { get; set; }

    public bool? Fulltime { get; set; }

    public string? PhoneNumber { get; set; }

    public string? ImgUrl { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<Notification> NotificationAccounts { get; set; } = new List<Notification>();

    public virtual ICollection<Notification> NotificationCreatedByNavigations { get; set; } = new List<Notification>();

    public virtual ICollection<Parent> Parents { get; set; } = new List<Parent>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<SessionRecord> SessionRecords { get; set; } = new List<SessionRecord>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<WebcamRecord> WebcamRecords { get; set; } = new List<WebcamRecord>();
}
