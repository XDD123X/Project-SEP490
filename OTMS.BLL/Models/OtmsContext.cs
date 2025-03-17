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
            entity.HasKey(e => e.AccountId).HasName("PK__Account__46A222CD9E981A2A");

            entity.ToTable("Account");

            entity.HasIndex(e => e.Email, "UQ__Account__AB6E6164018EC460").IsUnique();

            entity.Property(e => e.AccountId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("account_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Dob)
                .HasDefaultValueSql("(NULL)")
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
            entity.Property(e => e.ImgUrl)
                .HasMaxLength(500)
                .HasDefaultValue("https://ui.shadcn.com/avatars/shadcn.jpg")
                .HasColumnName("img_url");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(15)
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
            entity.HasKey(e => e.AttendanceId).HasName("PK__Attendan__20D6A968723A5983");

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
                .HasConstraintName("FK__Attendanc__sessi__693CA210");

            entity.HasOne(d => d.Student).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__stude__6A30C649");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Class__FDF47986687BF163");

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
                .HasConstraintName("FK__Class__course_id__5070F446");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.Classes)
                .HasForeignKey(d => d.LecturerId)
                .HasConstraintName("FK__Class__lecturer___4F7CD00D");
        });

        modelBuilder.Entity<ClassSetting>(entity =>
        {
            entity.HasKey(e => e.SettingId).HasName("PK__ClassSet__256E1E3233A0C66E");

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
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasKey(e => e.ClassStudentId).HasName("PK__ClassStu__86B74A0BD362AFAB");

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
                .HasConstraintName("FK__ClassStud__class__6383C8BA");

            entity.HasOne(d => d.Student).WithMany(p => p.ClassStudents)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ClassStud__stude__6477ECF3");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Course__8F1EF7AE16363FFD");

            entity.ToTable("Course");

            entity.HasIndex(e => e.CourseName, "UQ__Course__B5B2A66A159FF9A7").IsUnique();

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
                .HasConstraintName("FK__Course__created___49C3F6B7");
        });

        modelBuilder.Entity<LecturerSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__Lecturer__C46A8A6F47E82DCB");

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
                .HasConstraintName("FK__LecturerS__lectu__18EBB532");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__E059842F5C2E126A");

            entity.ToTable("Notification");

            entity.Property(e => e.NotificationId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("notification_id");
            entity.Property(e => e.Content)
                .HasMaxLength(255)
                .HasColumnName("content");
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
                .HasConstraintName("FK__Notificat__creat__778AC167");
        });

        modelBuilder.Entity<Parent>(entity =>
        {
            entity.HasKey(e => e.ParentId).HasName("PK__Parent__F2A60819BF37098F");

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
                .HasConstraintName("FK__Parent__student___70DDC3D8");
        });

        modelBuilder.Entity<ProfileChangeRequest>(entity =>
        {
            entity.HasKey(e => e.RequestChangeId).HasName("PK__ProfileC__046EBDB0FED18AAB");

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
                .HasConstraintName("FK__ProfileCh__accou__114A936A");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.ProfileChangeRequestApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__ProfileCh__appro__123EB7A3");
        });

        modelBuilder.Entity<Record>(entity =>
        {
            entity.HasKey(e => e.RecordId).HasName("PK__Record__BFCFB4DD37654F0F");

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
                .HasMaxLength(255)
                .HasColumnName("uploaded_by");
            entity.Property(e => e.VideoUrl)
                .HasMaxLength(500)
                .HasColumnName("video_url");

            entity.HasOne(d => d.Session).WithMany(p => p.Records)
                .HasForeignKey(d => d.SessionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Record__session___5EBF139D");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PK__RefreshT__CB3C9E1707D5CF5A");

            entity.ToTable("RefreshToken");

            entity.HasIndex(e => e.Token, "UQ__RefreshT__CA90DA7AA59F8328").IsUnique();

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
                .HasConstraintName("FK__RefreshTo__accou__7D439ABD");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__760965CC9191329E");

            entity.ToTable("Role");

            entity.HasIndex(e => e.Name, "UQ__Role__72E12F1B0C579808").IsUnique();

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
            entity.HasKey(e => e.SessionId).HasName("PK__Session__69B13FDCDBB90E8E");

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
                .HasConstraintName("FK__Session__class_i__571DF1D5");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.LecturerId)
                .HasConstraintName("FK__Session__lecture__5812160E");
        });

        modelBuilder.Entity<SessionChangeRequest>(entity =>
        {
            entity.HasKey(e => e.RequestChangeId).HasName("PK__SessionC__046EBDB04D772418");

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
                .HasConstraintName("FK__SessionCh__appro__0A9D95DB");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.SessionChangeRequestLecturers)
                .HasForeignKey(d => d.LecturerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SessionCh__lectu__09A971A2");

            entity.HasOne(d => d.Session).WithMany(p => p.SessionChangeRequests)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__SessionCh__sessi__08B54D69");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
