﻿using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace OTMS.BLL.Models;

public partial class OtmsContext : DbContext
{
    public OtmsContext()
    {
    }

    public OtmsContext(DbContextOptions<OtmsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<ClassSetting> ClassSettings { get; set; }

    public virtual DbSet<ClassStudent> ClassStudents { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<LecturerSchedule> LecturerSchedules { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<NotificationAccount> NotificationAccounts { get; set; }

    public virtual DbSet<NotificationRole> NotificationRoles { get; set; }

    public virtual DbSet<Parent> Parents { get; set; }

    public virtual DbSet<ProfileChangeRequest> ProfileChangeRequests { get; set; }

    public virtual DbSet<Record> Records { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<SessionChangeRequest> SessionChangeRequests { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        Console.WriteLine(Directory.GetCurrentDirectory());
        IConfiguration config = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", true, true)
        .Build();
        var strConn = config["ConnectionStrings:DefaultConnection"];
        optionsBuilder.UseSqlServer(strConn);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.AccountId).HasName("PK__Account__46A222CD54B23EE7");

            entity.ToTable("Account");

            entity.HasIndex(e => e.Email, "UQ__Account__AB6E6164C7C4AF5E").IsUnique();

            entity.Property(e => e.AccountId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("account_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Dob)
                .HasDefaultValue(new DateOnly(2000, 1, 1))
                .HasColumnName("dob");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Fulltime)
                .HasDefaultValue(true)
                .HasColumnName("fulltime");
            entity.Property(e => e.Gender)
                .HasDefaultValue(false)
                .HasColumnName("gender");
            entity.Property(e => e.ImgUrl)
                .HasMaxLength(500)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("img_url");
            entity.Property(e => e.MeetUrl)
                .HasMaxLength(500)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("meet_url");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(15)
                .HasDefaultValue("0123456789")
                .HasColumnName("phone_number");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(NULL)")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Role).WithMany(p => p.Accounts)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Account__role_id__403A8C7D");
        });

        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.AttendanceId).HasName("PK__Attendan__20D6A9681C30AF92");

            entity.ToTable("Attendance");

            entity.Property(e => e.AttendanceId).HasColumnName("attendance_id");
            entity.Property(e => e.AttendanceTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("attendance_time");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ImgUrl)
                .HasMaxLength(500)
                .HasColumnName("img_url");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(0)
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Session).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.SessionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__sessi__6EF57B66");

            entity.HasOne(d => d.Student).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__stude__6FE99F9F");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Class__FDF4798652A35443");

            entity.ToTable("Class");

            entity.Property(e => e.ClassId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("class_id");
            entity.Property(e => e.ClassCode)
                .HasMaxLength(50)
                .HasColumnName("class_code");
            entity.Property(e => e.ClassName)
                .HasMaxLength(100)
                .HasColumnName("class_name");
            entity.Property(e => e.ClassUrl)
                .HasMaxLength(100)
                .HasDefaultValue("https://example.com/meet/euf-nwbu-cet")
                .HasColumnName("class_url");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EndDate)
                .HasColumnType("datetime")
                .HasColumnName("end_date");
            entity.Property(e => e.LecturerId).HasColumnName("lecturer_id");
            entity.Property(e => e.Scheduled)
                .HasDefaultValue(false)
                .HasColumnName("scheduled");
            entity.Property(e => e.StartDate)
                .HasColumnType("datetime")
                .HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.TotalSession).HasColumnName("total_session");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Course).WithMany(p => p.Classes)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Class__course_id__534D60F1");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.Classes)
                .HasForeignKey(d => d.LecturerId)
                .HasConstraintName("FK__Class__lecturer___52593CB8");
        });

        modelBuilder.Entity<ClassSetting>(entity =>
        {
            entity.HasKey(e => e.SettingId).HasName("PK__ClassSet__256E1E3285C71421");

            entity.ToTable("ClassSetting");

            entity.Property(e => e.SettingId).HasColumnName("setting_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.SessionPerWeek)
                .HasDefaultValue(2)
                .HasColumnName("session_per_week");
            entity.Property(e => e.SessionTotal)
                .HasDefaultValue(32)
                .HasColumnName("session_total");
            entity.Property(e => e.SlotNumber)
                .HasDefaultValue(4)
                .HasColumnName("slot_number");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasKey(e => e.ClassStudentId).HasName("PK__ClassStu__86B74A0BDEFEE92B");

            entity.ToTable("ClassStudent");

            entity.Property(e => e.ClassStudentId).HasColumnName("class_student_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Class).WithMany(p => p.ClassStudents)
                .HasForeignKey(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ClassStud__class__693CA210");

            entity.HasOne(d => d.Student).WithMany(p => p.ClassStudents)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ClassStud__stude__6A30C649");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Course__8F1EF7AEA787056A");

            entity.ToTable("Course");

            entity.HasIndex(e => e.CourseName, "UQ__Course__B5B2A66A21A443CC").IsUnique();

            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.CourseName)
                .HasMaxLength(100)
                .HasColumnName("course_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Courses)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Course__created___4CA06362");
        });

        modelBuilder.Entity<LecturerSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__Lecturer__C46A8A6F48AC75C6");

            entity.ToTable("LecturerSchedule");

            entity.Property(e => e.ScheduleId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("schedule_id");
            entity.Property(e => e.LecturerId).HasColumnName("lecturer_id");
            entity.Property(e => e.SlotAvailable)
                .HasMaxLength(50)
                .HasDefaultValue("1,2,3,4")
                .HasColumnName("slot_available");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.WeekdayAvailable)
                .HasMaxLength(50)
                .HasDefaultValue("2,3,4,5,6,7,8")
                .HasColumnName("weekday_available");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.LecturerSchedules)
                .HasForeignKey(d => d.LecturerId)
                .HasConstraintName("FK__LecturerS__lectu__2739D489");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__E059842F3CFC5406");

            entity.ToTable("Notification");

            entity.Property(e => e.NotificationId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("notification_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.Type)
                .HasDefaultValue(0)
                .HasColumnName("type");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificat__creat__7D439ABD");
        });

        modelBuilder.Entity<NotificationAccount>(entity =>
        {
            entity.HasKey(e => new { e.NotificationId, e.AccountId }).HasName("PK__Notifica__2433A6039E73C69A");

            entity.ToTable("NotificationAccount");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.AccountId).HasColumnName("account_id");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");

            entity.HasOne(d => d.Account).WithMany(p => p.NotificationAccounts)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__Notificat__accou__04E4BC85");

            entity.HasOne(d => d.Notification).WithMany(p => p.NotificationAccounts)
                .HasForeignKey(d => d.NotificationId)
                .HasConstraintName("FK__Notificat__notif__03F0984C");
        });

        modelBuilder.Entity<NotificationRole>(entity =>
        {
            entity.HasKey(e => new { e.NotificationId, e.RoleName }).HasName("PK__Notifica__F7DAA164D752A60C");

            entity.ToTable("NotificationRole");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .HasColumnName("role_name");

            entity.HasOne(d => d.Notification).WithMany(p => p.NotificationRoles)
                .HasForeignKey(d => d.NotificationId)
                .HasConstraintName("FK__Notificat__notif__01142BA1");
        });

        modelBuilder.Entity<Parent>(entity =>
        {
            entity.HasKey(e => e.ParentId).HasName("PK__Parent__F2A6081924342C74");

            entity.ToTable("Parent");

            entity.Property(e => e.ParentId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("parent_id");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Gender)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("gender");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Student).WithMany(p => p.Parents)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Parent__student___76969D2E");
        });

        modelBuilder.Entity<ProfileChangeRequest>(entity =>
        {
            entity.HasKey(e => e.RequestChangeId).HasName("PK__ProfileC__046EBDB0FB911B01");

            entity.ToTable("ProfileChangeRequest");

            entity.Property(e => e.RequestChangeId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("request_change_id");
            entity.Property(e => e.AccountId).HasColumnName("account_id");
            entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate)
                .HasColumnType("datetime")
                .HasColumnName("approved_date");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ImgUrlNew)
                .HasMaxLength(500)
                .HasColumnName("img_url_new");
            entity.Property(e => e.ImgUrlOld)
                .HasMaxLength(500)
                .HasColumnName("img_url_old");
            entity.Property(e => e.Status)
                .HasDefaultValue(0)
                .HasColumnName("status");

            entity.HasOne(d => d.Account).WithMany(p => p.ProfileChangeRequestAccounts)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__ProfileCh__accou__1F98B2C1");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.ProfileChangeRequestApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__ProfileCh__appro__208CD6FA");
        });

        modelBuilder.Entity<Record>(entity =>
        {
            entity.HasKey(e => e.RecordId).HasName("PK__Record__BFCFB4DDC4BF29F9");

            entity.ToTable("Record");

            entity.Property(e => e.RecordId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("record_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UploadedBy)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("uploaded_by");
            entity.Property(e => e.VideoUrl)
                .HasMaxLength(500)
                .HasColumnName("video_url");

            entity.HasOne(d => d.Session).WithMany(p => p.Records)
                .HasForeignKey(d => d.SessionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Record__session___6383C8BA");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PK__RefreshT__CB3C9E17C06F7DF5");

            entity.ToTable("RefreshToken");

            entity.HasIndex(e => e.Token, "UQ__RefreshT__CA90DA7A82BBCEA2").IsUnique();

            entity.Property(e => e.TokenId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("token_id");
            entity.Property(e => e.AccountId).HasColumnName("account_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("datetime")
                .HasColumnName("expires_at");
            entity.Property(e => e.RevokedAt)
                .HasColumnType("datetime")
                .HasColumnName("revoked_at");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.Token)
                .HasMaxLength(500)
                .HasColumnName("token");

            entity.HasOne(d => d.Account).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__RefreshTo__accou__0A9D95DB");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__760965CC2412F59E");

            entity.ToTable("Role");

            entity.HasIndex(e => e.Name, "UQ__Role__72E12F1BE47C34D2").IsUnique();

            entity.Property(e => e.RoleId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("role_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(NULL)")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PK__Session__69B13FDC7F6BFFA5");

            entity.ToTable("Session");

            entity.Property(e => e.SessionId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("session_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.LecturerId).HasColumnName("lecturer_id");
            entity.Property(e => e.SessionDate)
                .HasColumnType("datetime")
                .HasColumnName("session_date");
            entity.Property(e => e.SessionNumber)
                .HasDefaultValue(0)
                .HasColumnName("session_number");
            entity.Property(e => e.SessionRecord)
                .HasColumnType("datetime")
                .HasColumnName("session_record");
            entity.Property(e => e.Slot).HasColumnName("slot");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.Type)
                .HasDefaultValue(1)
                .HasColumnName("type");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Class).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Session__class_i__5BE2A6F2");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.LecturerId)
                .HasConstraintName("FK__Session__lecture__5CD6CB2B");
        });

        modelBuilder.Entity<SessionChangeRequest>(entity =>
        {
            entity.HasKey(e => e.RequestChangeId).HasName("PK__SessionC__046EBDB0B19C88E8");

            entity.ToTable("SessionChangeRequest");

            entity.Property(e => e.RequestChangeId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("request_change_id");
            entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
            entity.Property(e => e.ApprovedDate)
                .HasColumnType("datetime")
                .HasColumnName("approved_date");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.LecturerId).HasColumnName("lecturer_id");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(0)
                .HasColumnName("status");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.SessionChangeRequestApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__SessionCh__appro__18EBB532");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.SessionChangeRequestLecturers)
                .HasForeignKey(d => d.LecturerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SessionCh__lectu__17F790F9");

            entity.HasOne(d => d.Session).WithMany(p => p.SessionChangeRequests)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__SessionCh__sessi__17036CC0");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
