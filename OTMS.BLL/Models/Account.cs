using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Account
{
    public Guid AccountId { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public Guid RoleId { get; set; }

    public bool? Fulltime { get; set; }

    public string? PhoneNumber { get; set; }

    public DateOnly? Dob { get; set; }

    public bool? Gender { get; set; }

    public string? ImgUrl { get; set; }

    public string? MeetUrl { get; set; }

    public int Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<File> Files { get; set; } = new List<File>();

    public virtual ICollection<LecturerSchedule> LecturerSchedules { get; set; } = new List<LecturerSchedule>();

    public virtual ICollection<NotificationAccount> NotificationAccounts { get; set; } = new List<NotificationAccount>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Parent> Parents { get; set; } = new List<Parent>();

    public virtual ICollection<ProfileChangeRequest> ProfileChangeRequestAccounts { get; set; } = new List<ProfileChangeRequest>();

    public virtual ICollection<ProfileChangeRequest> ProfileChangeRequestApprovedByNavigations { get; set; } = new List<ProfileChangeRequest>();

    public virtual ICollection<Record> Records { get; set; } = new List<Record>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<SessionChangeRequest> SessionChangeRequestApprovedByNavigations { get; set; } = new List<SessionChangeRequest>();

    public virtual ICollection<SessionChangeRequest> SessionChangeRequestLecturers { get; set; } = new List<SessionChangeRequest>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
}
