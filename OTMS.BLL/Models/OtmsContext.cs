using System;
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

    public virtual DbSet<File> Files { get; set; }

    public virtual DbSet<LecturerSchedule> LecturerSchedules { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<NotificationAccount> NotificationAccounts { get; set; }

    public virtual DbSet<NotificationRole> NotificationRoles { get; set; }

    public virtual DbSet<Parent> Parents { get; set; }

    public virtual DbSet<ProfileChangeRequest> ProfileChangeRequests { get; set; }

    public virtual DbSet<Record> Records { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Report> Reports { get; set; }

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
            entity.HasKey(e => e.AccountId).HasName("PK__Account__46A222CD767FFE6D");

            entity.ToTable("Account");

            entity.HasIndex(e => e.Email, "UQ__Account__AB6E616408F3EA68").IsUnique();

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
            entity.HasKey(e => e.AttendanceId).HasName("PK__Attendan__20D6A968D1B1DF89");

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
            entity.Property(e => e.Note)
                .HasMaxLength(255)
                .HasColumnName("note");
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
                .HasConstraintName("FK__Attendanc__sessi__7E37BEF6");

            entity.HasOne(d => d.Student).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__Attendanc__stude__7F2BE32F");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Class__FDF47986C144C587");

            entity.ToTable("Class");

            entity.HasIndex(e => e.ClassCode, "UQ__Class__0AF9B2E4C40C607C").IsUnique();

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
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Class__course_id__5535A963");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.Classes)
                .HasForeignKey(d => d.LecturerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Class__lecturer___5441852A");
        });

        modelBuilder.Entity<ClassSetting>(entity =>
        {
            entity.HasKey(e => e.SettingId).HasName("PK__ClassSet__256E1E32709AE575");

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
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasDefaultValue("Setting #")
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasKey(e => e.ClassStudentId).HasName("PK__ClassStu__86B74A0BFC164955");

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
                .HasConstraintName("FK__ClassStud__class__787EE5A0");

            entity.HasOne(d => d.Student).WithMany(p => p.ClassStudents)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__ClassStud__stude__797309D9");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Course__8F1EF7AE1C18733D");

            entity.ToTable("Course");

            entity.HasIndex(e => e.CourseName, "UQ__Course__B5B2A66AD49F5F55").IsUnique();

            entity.Property(e => e.CourseId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("course_id");
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
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Course__created___4D94879B");
        });

        modelBuilder.Entity<File>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__File__07D884C6D60CE74E");

            entity.ToTable("File");

            entity.Property(e => e.FileId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("file_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.FileName)
                .HasMaxLength(500)
                .HasColumnName("file_name");
            entity.Property(e => e.FileSize)
                .HasMaxLength(20)
                .HasColumnName("file_size");
            entity.Property(e => e.FileUrl)
                .HasMaxLength(500)
                .HasColumnName("file_url");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UploadedBy).HasColumnName("uploaded_by");

            entity.HasOne(d => d.Session).WithMany(p => p.Files)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__File__session_id__72C60C4A");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.Files)
                .HasForeignKey(d => d.UploadedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__File__uploaded_b__73BA3083");
        });

        modelBuilder.Entity<LecturerSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__Lecturer__C46A8A6FDF368392");

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
                .HasConstraintName("FK__LecturerS__lectu__3864608B");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__E059842F48D9AE09");

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
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Notificat__creat__0C85DE4D");
        });

        modelBuilder.Entity<NotificationAccount>(entity =>
        {
            entity.HasKey(e => new { e.NotificationId, e.AccountId }).HasName("PK__Notifica__2433A6037A6B2AEB");

            entity.ToTable("NotificationAccount");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.AccountId).HasColumnName("account_id");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");

            entity.HasOne(d => d.Account).WithMany(p => p.NotificationAccounts)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK__Notificat__accou__14270015");

            entity.HasOne(d => d.Notification).WithMany(p => p.NotificationAccounts)
                .HasForeignKey(d => d.NotificationId)
                .HasConstraintName("FK__Notificat__notif__1332DBDC");
        });

        modelBuilder.Entity<NotificationRole>(entity =>
        {
            entity.HasKey(e => new { e.NotificationId, e.RoleName }).HasName("PK__Notifica__F7DAA1643452D48A");

            entity.ToTable("NotificationRole");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .HasColumnName("role_name");

            entity.HasOne(d => d.Notification).WithMany(p => p.NotificationRoles)
                .HasForeignKey(d => d.NotificationId)
                .HasConstraintName("FK__Notificat__notif__10566F31");
        });

        modelBuilder.Entity<Parent>(entity =>
        {
            entity.HasKey(e => e.ParentId).HasName("PK__Parent__F2A60819FAE19F6A");

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
                .HasConstraintName("FK__Parent__student___05D8E0BE");
        });

        modelBuilder.Entity<ProfileChangeRequest>(entity =>
        {
            entity.HasKey(e => e.RequestChangeId).HasName("PK__ProfileC__046EBDB01596102C");

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
            entity.Property(e => e.Description).HasColumnName("description");
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
                .HasConstraintName("FK__ProfileCh__accou__30C33EC3");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.ProfileChangeRequestApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__ProfileCh__appro__31B762FC");
        });

        modelBuilder.Entity<Record>(entity =>
        {
            entity.HasKey(e => e.RecordId).HasName("PK__Record__BFCFB4DDB75CFD6F");

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
            entity.Property(e => e.Duration)
                .HasMaxLength(20)
                .HasColumnName("duration");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UploadedBy).HasColumnName("uploaded_by");
            entity.Property(e => e.VideoUrl)
                .HasMaxLength(500)
                .HasColumnName("video_url");

            entity.HasOne(d => d.Session).WithMany(p => p.Records)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__Record__session___6477ECF3");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.Records)
                .HasForeignKey(d => d.UploadedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Record__uploaded__656C112C");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PK__RefreshT__CB3C9E17C0CAC829");

            entity.ToTable("RefreshToken");

            entity.HasIndex(e => e.Token, "UQ__RefreshT__CA90DA7A11E85817").IsUnique();

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
                .HasConstraintName("FK__RefreshTo__accou__19DFD96B");
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasKey(e => e.ReportId).HasName("PK__Report__779B7C58790CFA22");

            entity.ToTable("Report");

            entity.Property(e => e.ReportId)
                .HasDefaultValueSql("(newid())")
                .HasColumnName("report_id");
            entity.Property(e => e.AnalysisData).HasColumnName("analysis_data");
            entity.Property(e => e.GeminiResponse).HasColumnName("gemini_response");
            entity.Property(e => e.GeneratedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("generated_at");
            entity.Property(e => e.GeneratedBy).HasColumnName("generated_by");
            entity.Property(e => e.RecordId).HasColumnName("record_id");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");

            entity.HasOne(d => d.GeneratedByNavigation).WithMany(p => p.Reports)
                .HasForeignKey(d => d.GeneratedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Report__generate__6E01572D");

            entity.HasOne(d => d.Record).WithMany(p => p.Reports)
                .HasForeignKey(d => d.RecordId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Report__record_i__6B24EA82");

            entity.HasOne(d => d.Session).WithMany(p => p.Reports)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__Report__session___6C190EBB");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__760965CC7A391423");

            entity.ToTable("Role");

            entity.HasIndex(e => e.Name, "UQ__Role__72E12F1BC7604687").IsUnique();

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
            entity.HasKey(e => e.SessionId).HasName("PK__Session__69B13FDCD76716D6");

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
                .HasConstraintName("FK__Session__class_i__5CD6CB2B");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.LecturerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Session__lecture__5DCAEF64");
        });

        modelBuilder.Entity<SessionChangeRequest>(entity =>
        {
            entity.HasKey(e => e.RequestChangeId).HasName("PK__SessionC__046EBDB07C4A8E8E");

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
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.LecturerId).HasColumnName("lecturer_id");
            entity.Property(e => e.NewDate).HasColumnName("new_date");
            entity.Property(e => e.NewSlot).HasColumnName("new_slot");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.OldDate).HasColumnName("old_date");
            entity.Property(e => e.OldSlot).HasColumnName("old_slot");
            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(0)
                .HasColumnName("status");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.SessionChangeRequestApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__SessionCh__appro__29221CFB");

            entity.HasOne(d => d.Lecturer).WithMany(p => p.SessionChangeRequestLecturers)
                .HasForeignKey(d => d.LecturerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SessionCh__lectu__282DF8C2");

            entity.HasOne(d => d.Session).WithMany(p => p.SessionChangeRequests)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__SessionCh__sessi__2739D489");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
