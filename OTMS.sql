-- Xoá và tạo lại cơ sở dữ liệu
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'OTMS')
BEGIN
    ALTER DATABASE OTMS SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE OTMS;
END;
GO

CREATE DATABASE OTMS;
GO

USE OTMS;
GO

-- 1. Tạo bảng Role
CREATE TABLE Role (
    role_id uniqueidentifier  PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT NULL,
    status INT DEFAULT 1
);
GO

-- 2. Tạo bảng Account
CREATE TABLE Account (
    account_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    role_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Role(role_id),
    fulltime BIT NULL DEFAULT 1,
    phone_number NVARCHAR(15) NULL DEFAULT '0123456789',
	dob DATE NULL DEFAULT '01/01/2000',
	gender BIT NULL DEFAULT 0, --giới tính 0 nữ 1 nam
    img_url NVARCHAR(500) DEFAULT NULL,
	meet_url NVARCHAR(500) DEFAULT NULL,
	status INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE() ,
    updated_at DATETIME DEFAULT NULL
);
GO

-- 3. Tạo bảng Course
CREATE TABLE Course (
    course_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    course_name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255),
    created_by uniqueidentifier NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    status INT DEFAULT 1
);
GO

-- 4. Tạo bảng Class
CREATE TABLE Class (
    class_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    class_code NVARCHAR(50) NOT NULL UNIQUE,
    class_name NVARCHAR(100) NOT NULL,
	lecturer_id uniqueidentifier NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE SET NULL,
    course_id uniqueidentifier NULL FOREIGN KEY REFERENCES Course(course_id) ON DELETE SET NULL,
    total_session INT NOT NULL,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
	class_url NVARCHAR(100) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    status INT DEFAULT 1,
	scheduled BIT NULL DEFAULT 0,
);
GO

-- 5. Tạo bảng Session
CREATE TABLE Session (
    session_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
	session_number INT DEFAULT 0,
    class_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Class(class_id) ON DELETE CASCADE,
    lecturer_id uniqueidentifier NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE SET NULL,
    session_date DATETIME NOT NULL,
    slot INT NOT NULL,
    description NVARCHAR(255),
    session_record DATETIME NULL,
	type INT DEFAULT 1,
    status INT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
GO

-- 6. Tạo bảng SessionRecord
CREATE TABLE Record (
    record_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    session_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Session(session_id) ON DELETE CASCADE,
    video_url NVARCHAR(500),
    duration NVARCHAR(20),
    description NVARCHAR(255),
	uploaded_by uniqueidentifier NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    status INT DEFAULT 1
);
GO

CREATE TABLE Report (
    report_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    record_id UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Record(record_id) ON DELETE NO ACTION,  -- Set NULL khi xóa Record
    session_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Session(session_id) ON DELETE CASCADE,  -- Xóa Report khi xóa Session
    analysis_data NVARCHAR(MAX) NULL,  -- Lưu dữ liệu phân tích dưới dạng JSON
    generated_at DATETIME DEFAULT GETDATE(),
    generated_by UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE SET NULL, -- Người tạo báo cáo (AI hoặc con người)
    gemini_response NVARCHAR(MAX) NULL,
    status INT DEFAULT 1 -- 1: Active, 0: Inactive (hoặc có thể mở rộng trạng thái khác)
);
GO

-- 6. Tạo bảng SessionRecord
CREATE TABLE [File] (
    file_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    session_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Session(session_id) ON DELETE CASCADE,
    file_name NVARCHAR(500),
    file_url NVARCHAR(500),
    file_size NVARCHAR(20),
    description NVARCHAR(255),
	uploaded_by uniqueidentifier NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    status INT DEFAULT 1
);
GO


-- 7. Tạo bảng ClassStudent
CREATE TABLE ClassStudent (
    class_student_id INT PRIMARY KEY IDENTITY(1,1),
    class_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Class(class_id) ON DELETE CASCADE,
    student_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    status INT DEFAULT 1
);
GO

-- 8. Tạo bảng Attendance
CREATE TABLE Attendance (
    attendance_id INT PRIMARY KEY IDENTITY(1,1),
    session_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Session(session_id) ON DELETE CASCADE,
    student_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE CASCADE,
    status INT NULL DEFAULT 0,
	note NVARCHAR(255) NULL,
    attendance_time DATETIME DEFAULT GETDATE(),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
GO

-- 9. Tạo bảng Parent
CREATE TABLE Parent (
    parent_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    student_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE CASCADE,
    full_name NVARCHAR(100) NOT NULL,
	gender bit DEFAULT NULL,
    phone_number NVARCHAR(20) NULL,
    email NVARCHAR(100) NULL,
    status INT DEFAULT 1
);
GO

-- 10. Tạo bảng Notification
CREATE TABLE Notification (
    notification_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    type INT DEFAULT 0, -- 0: chung, 1: theo role, 2: theo account
    created_by UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
GO

-- Bảng trung gian để lưu thông báo theo role
CREATE TABLE NotificationRole (
    notification_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Notification(notification_id) ON DELETE CASCADE,
    -- role_name NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Role(role_name) ON DELETE CASCADE,
	role_name NVARCHAR(50) NOT NULL,
    PRIMARY KEY (notification_id, role_name)
);
GO

-- Bảng trung gian để lưu thông báo theo account
CREATE TABLE NotificationAccount (
    notification_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Notification(notification_id) ON DELETE CASCADE,
    account_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE CASCADE,
    is_read BIT DEFAULT 0, -- Trạng thái đã đọc
    PRIMARY KEY (notification_id, account_id)
);
GO



-- 11. Tạo bảng RefreshToken
CREATE TABLE RefreshToken (
    token_id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    account_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE CASCADE,
    token NVARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    revoked_at DATETIME NULL,  -- Thời điểm token bị thu hồi (nếu có)
    status INT DEFAULT 1        -- 1: Hoạt động, 0: Bị thu hồi
);
GO


-- 13. Tạo bảng ClassSetting
CREATE TABLE ClassSetting (
    setting_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(100) DEFAULT N'Setting #',
	slot_number INT DEFAULT 4, -- số slot có trong một ngày
    session_per_week INT DEFAULT 2,  -- Số buổi học tối đa mỗi tuần
    session_total INT NOT NULL DEFAULT 32, -- Tổng số buổi học mặc định
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

INSERT INTO ClassSetting (title, session_per_week, session_total, slot_number)  
VALUES 
('Default', 1, 24, 4),       -- 1 buổi/tuần, 24 buổi (36 giờ)  
('Basic', 2, 48, 4),          -- 2 buổi/tuần, 48 buổi (72 giờ)  
('Intermediate', 3, 72, 4),   -- 3 buổi/tuần, 72 buổi (108 giờ)  
('Advanced', 4, 96, 4);       -- 4 buổi/tuần, 96 buổi (144 giờ)
GO


-- 14. Tạo bảng SessionChangeRequest
CREATE TABLE SessionChangeRequest (
    request_change_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    session_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Session(session_id) ON DELETE CASCADE,
    lecturer_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Account(account_id),
    approved_by UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Account(account_id) ,
    description NVARCHAR(MAX) NULL,
    note NVARCHAR(MAX) NULL,
    approved_date DATETIME NULL,
    status INT DEFAULT 0 CHECK (status IN (0, 1, 2)), -- 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
    created_at DATETIME DEFAULT GETDATE(),
    
    -- Thêm thông tin ngày và slot mới
    new_date DATE NOT NULL,  -- Ngày yêu cầu đổi
    new_slot INT NOT NULL CHECK (new_slot BETWEEN 1 AND 4), -- Slot mới yêu cầu đổi
    old_date DATE NULL, -- Ngày cũ của buổi học
    old_slot INT NULL -- Slot cũ của buổi học
);
GO

-- 15. Tạo bảng ProfileChangeRequest
CREATE TABLE ProfileChangeRequest (
    request_change_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    account_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE CASCADE,
    img_url_old NVARCHAR(500) NOT NULL,
    img_url_new NVARCHAR(500) NOT NULL,
    approved_by UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Account(account_id),
	description NVARCHAR(MAX) NULL,
    approved_date DATETIME NULL,
    status INT DEFAULT 0 CHECK (status IN (0, 1, 2)), -- 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 16. Tạo bảng LecturerSchedule
CREATE TABLE LecturerSchedule (
    schedule_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    lecturer_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Account(account_id) ON DELETE CASCADE,
    slot_available NVARCHAR(50) DEFAULT '1,2,3,4',  -- Mặc định giáo viên có tất cả các slot 1,2,3,4
    weekday_available NVARCHAR(50) DEFAULT '2,3,4,5,6,7,8', -- Mặc định từ thứ 2 đến chủ nhật
    updated_at DATETIME DEFAULT GETDATE()
);


-- 12. Thêm dữ liệu mẫu cho Role
--INSERT INTO Role (name, description)
--VALUES 
--('Administrator', N'Quản lý hệ thống'),
--('Lecturer', N'Giảng dạy các lớp học'),
--('Student', N'Tham gia lớp học'),
--('Officer', N'Quản lý lớp học và lịch học');
INSERT [dbo].[Role] ([role_id], [name], [description], [created_at], [updated_at], [status]) VALUES (N'51d021e3-8d9a-4f77-96db-2917fd87a861', N'Officer', N'Quản lý lớp học và lịch học', CAST(N'2025-05-01T23:48:38.437' AS DateTime), NULL, 1)
INSERT [dbo].[Role] ([role_id], [name], [description], [created_at], [updated_at], [status]) VALUES (N'0c4ad1c3-e4e2-4b7f-bf17-345c8416bf6f', N'Lecturer', N'Giảng dạy các lớp học', CAST(N'2025-05-01T23:48:38.437' AS DateTime), NULL, 1)
INSERT [dbo].[Role] ([role_id], [name], [description], [created_at], [updated_at], [status]) VALUES (N'922e5929-2aee-479c-84b1-6910c0f3c116', N'Administrator', N'Quản lý hệ thống', CAST(N'2025-05-01T23:48:38.437' AS DateTime), NULL, 1)
INSERT [dbo].[Role] ([role_id], [name], [description], [created_at], [updated_at], [status]) VALUES (N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', N'Student', N'Tham gia lớp học', CAST(N'2025-05-01T23:48:38.437' AS DateTime), NULL, 1)

GO

-- 17. Thêm dữ liệu mẫu cho Account
--INSERT INTO Account ( email, password, full_name, role_id, status, gender, created_at)
--VALUES 
--( 'admin@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Văn Quân', (select role_id from Role where name = 'Administrator'), 1, 1,  GETDATE()), --password: matkhau123
--( 'officer1@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Trần Thị Mai', (select role_id from Role where name = 'Officer'), 1, 0,  GETDATE()), --password: matkhau123
--( 'officer2@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phạm Hoàng Nam', (select role_id from Role where name = 'Officer'), 1, 1,  GETDATE()), --password: matkhau123
--( 'lecturer1@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lê Thanh Hải', (select role_id from Role where name = 'Lecturer'), 1, 1,  GETDATE()), --password: matkhau123
--( 'lecturer2@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Thị Lan', (select role_id from Role where name = 'Lecturer'), 1, 0,  GETDATE()), --password: matkhau123
--( 'lecturer3@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Doãn Minh Tài', (select role_id from Role where name = 'Lecturer'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student1@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Đỗ Quốc Đạt', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student2@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Bùi Văn Hiện', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student3@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Hoàng Linh', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
--( 'student4@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lương Thị Dân', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
--( 'student5@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phan Thanh Khánh', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student6@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Cao Văn Linh', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student7@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tôn Nữ Minh', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
--( 'student8@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tô Minh NHật', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student9@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Huỳnh Văn Trọng', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student10@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Đặng Thị Phan', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
--( 'student11@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Hoàng Minh Quân', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student12@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Ngô Văn Danh', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student13@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Vũ Thị Sinh', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
--( 'student14@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Mai Thanh Tí', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student15@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lý Minh Ưu', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
--( 'student16@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Châu Văn Việt', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()); --password: matkhau123
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'6ba4aa04-8c16-42c5-b575-00fa7a8c8c5f', N'student47@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Hoa', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746451854/nnue148irxhulchbfmxl.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'a58b9872-8d40-4c23-9fc2-0323439ecc52', N'student15@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lý Minh Ưu', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'687c5661-06fe-4ce9-b57b-04c835f5613d', N'student5@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phan Thanh Khánh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'2c43d71e-0ad3-41bf-a196-063f13f74152', N'student21@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyen Son Tung', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450604/pvtg8avdkd5ic5mjmcij.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'84141751-a051-43ef-bf4a-07d149da4cfe', N'student58@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tran Thanh Tam', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448925/ht6xhyxl5ulp4qds0xyx.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'2d992244-e4e4-46e3-85a1-083e9c92192c', N'student59@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tran Hong Ngoc', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448971/pmw72iq3pmou0cycvrkl.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'a2c1ac91-3e3d-4049-9f0c-09a1ba0808c0', N'student11@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Hoàng Minh Quân', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'd9870741-8e53-41ac-b39b-0b640ac7f2e7', N'student42@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phenado Diaz', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450314/nxqbwsiyjlwtgxq1vimq.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'188d05ac-14c1-4511-8d82-0eab1052f63f', N'student48@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Linh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746451874/w5hjttgacizlhf0rr50u.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'096f1fd5-d019-45eb-9664-14d8dff790d1', N'student53@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'UyenNhi', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746451968/j1irdpvcyiidykz0bxju.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'9bd08a19-54b6-48fb-8454-1a31ae54a02a', N'student37@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Amae Patel', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450003/u92yi6twvxsxktfuy1qd.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'6a9a5597-870f-4df6-a50f-1a4314a047cc', N'student14@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Mai Thanh Tí', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'6fd897e9-8a0a-4b66-9f37-1d667dcc4518', N'student45@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Wayne Haber', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450374/guoxrzthjebirvife175.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'4d536691-c92d-4475-a56f-1d965458f4ee', N'student49@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'TienDat', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746452019/qq59viipgwde3qvu96hl.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'b6219980-a35e-45b7-b7fa-22144a8b022a', N'student6@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Cao Văn Linh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'941961d3-3ec1-4bcc-bed4-22ffc1a52baa', N'student23@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Anoop Danwar', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449097/oshjgtkkqokfub8kleqd.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'9c990194-26f8-4731-a6b7-25e1d45b9b11', N'student50@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'TonVanKhanh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746451906/kjsmdnykm5n1a0tvtuvx.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'6fdf15d2-117c-4139-b699-2aeb5c649a2f', N'lecturer2@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Thị Lan', N'0c4ad1c3-e4e2-4b7f-bf17-345c8416bf6f', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'3116d98f-17b5-480d-b578-364bdf1f2570', N'student31@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lily Mai', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449579/n0gmkdqmenzbcpyuc2hs.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'1700b7b1-cda0-4e1c-9110-42efafc558cf', N'student41@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Person1', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450293/tfmcxh4qereezapltnxx.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'eacae410-9faa-4eff-80b0-4762cdc4854c', N'student55@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Bui Bich Phuong', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448752/uzm0nlxnq3lxjaiv11dp.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'bbd7a1f8-536b-41c2-994e-47884900f25d', N'lecturer1@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lê Thanh Hải', N'0c4ad1c3-e4e2-4b7f-bf17-345c8416bf6f', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'fa24b2da-f617-449b-8067-4eb4f2faf857', N'student17@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Do Gia Huy', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450493/u3dz8nulyjjqneqsa9t7.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'0d1b1484-cd6a-4cff-b35c-50084408d324', N'student54@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'VanNam', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746452143/diiaolxetd1jbozlcfb3.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'3e77132a-45dd-4b6d-8042-53d834446f0b', N'student9@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Huỳnh Văn Trọng', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'13de9586-998f-4189-b787-570e298af81b', N'student25@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Bryan Wise', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449171/oomsq7wugpsxbngi4c7d.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'3f7fbc2b-6e30-458d-bef9-5f15895accbb', N'student16@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Châu Văn Việt', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'e2025af5-c344-4d9d-9e29-615ba6cf6983', N'officer1@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Trần Thị Mai', N'51d021e3-8d9a-4f77-96db-2917fd87a861', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'6c1f4e0a-9350-423d-925d-65902aacd37c', N'student2@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Bùi Văn Hiện', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'75363cab-708d-4831-9e4e-6d49244b17be', N'student3@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Hoàng Linh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'5877bc4d-92f7-4425-8b51-6e67efb8c4f3', N'student99@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'TranBaoNhu', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 0, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448038/s9d4goimjbeaohvsle6p.png', NULL, 1, CAST(N'2025-05-05T18:35:59.770' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'f69c9efc-c28a-43b9-9246-6fcc7aa65792', N'student19@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyen Quang Truong', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450549/cxvsumom7uybfrfqoj1e.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'641fcff5-ca57-4783-b22b-7548eddd09be', N'student34@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Steve Loyd', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449651/jpygwhrai7zwz6iq7n2n.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'4f54aeff-094e-4dd0-a220-774972b95da4', N'student57@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Vu Viet Hoang', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://imgur.com/J8FpGnT.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'1a5be7b0-cfa7-4273-9108-7ffec0fbbd6c', N'student36@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tony Righetti', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449705/cuzhiwqd945srmyihp3v.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'156b848c-b11f-4631-a1af-81af15e0615b', N'student61@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyen Ngoc Han', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448887/xkx3cblmdgh9xla9pxaa.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'e477541b-fa59-4503-a827-82ccbc8f8f5c', N'officer2@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phạm Hoàng Nam', N'51d021e3-8d9a-4f77-96db-2917fd87a861', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'f434ed53-84ea-4f4d-ac73-8d589fcb5aa6', N'student1@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Đỗ Quốc Đạt', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'150c2f03-6557-4ebe-8750-986b80391c67', N'student35@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tabta Pazitny', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449677/ovcfgbfyvghqdtykk0qq.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'e25e9615-8a3f-43c5-a924-9b249695d9bb', N'student7@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tôn Nữ Minh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'a61783be-21b7-4727-80d7-9b963f1de010', N'hoangdl939@gmail.com', N'ec5676a0731d7774933de93cfab9634886e921bea06954177b7077aaa33c7660', N'Nguyễn Minh Hoàng', N'0c4ad1c3-e4e2-4b7f-bf17-345c8416bf6f', 1, N'0123456789', CAST(N'2002-03-05' AS Date), 1, NULL, NULL, 1, CAST(N'2025-05-05T00:05:24.707' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'0b570819-2185-4973-bf18-9e85e1db5189', N'student30@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lauren Backer', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449318/ncfqo0qejdegcwcufhw1.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'7b51d1a1-7025-4653-8ef7-9f6100109580', N'student32@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Mek stittri', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449603/gpebg08yue14m5vyhgdt.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'9130f3c1-27f2-4e0c-b859-a080d2e597ee', N'student33@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Sid Sijbrandij', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449628/urggyynpo54pfc2ay3v2.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'dc2436df-4bd7-4eda-afa2-a81286185a51', N'student46@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Hien', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746451832/jfjfxgtdbaow4p8zwj9p.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'7a37f703-31c7-4232-ab7f-a91137cae45d', N'student24@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Brian Robins', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449140/kwgy7d0x0egxnsizixeb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'f1e7f9ca-1b11-4906-931d-a9d7eefa4d0d', N'student51@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Trang', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746451928/gwas65uzribphyuefa1o.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'ee84ed5c-a35c-482d-a8f6-acdcee7e405d', N'student27@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Eric Johnson', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449236/ajms8yre3fbo1fxngvrf.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'd7feecd5-130d-4f88-bb40-b133cb4c5232', N'student52@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tung', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746451947/g0wkxhopjkb82q6aic6o.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'7108b28e-50a9-4d44-8a28-b2d51caf496f', N'student40@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Neil McC', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450248/nezlfjo7j63rjxlpelgt.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'a8444b51-507c-4855-8fdd-b70f16ef27da', N'student62@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Ngo Huong Giang', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448841/fyv71qkcwdaw9edtohfz.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'8329a134-ac86-4c62-973f-b73867b060b3', N'student12@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Ngô Văn Danh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'3707aa7a-38de-4ef7-ab1e-b741728826d1', N'student38@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Jay Swain', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450105/yysvkgxgibpyanuyf9lw.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'3356a40d-5f23-4ad7-b0c0-b9a5d97d8060', N'student18@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Le Hoang Chi', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450526/sqjx89fzoqsmbfethytu.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'81adf257-7ff8-49de-9808-ba4aecc7d16b', N'student63@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Do Bach Tung', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448806/ybuufg4rupohi6dm6fdz.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'aebf1e1a-3669-409e-b261-be3bf2588885', N'student39@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Mon Ray', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450130/p5whayqwcwv4g8lcagw1.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'5ab58f9e-1b13-4b0f-bf36-c56f078a39f7', N'student22@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyen Cong Phuong', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450623/gqcq40pwgrencudhmjhx.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'a14f544f-8009-444a-9c83-d4bf423c64c6', N'student43@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phil Calder', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450332/emodxpmxpv7cy46vfgwr.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'e1a63d43-bdf3-4482-abb8-d8d5202c7f9b', N'lecturer3@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Doãn Minh Tài', N'0c4ad1c3-e4e2-4b7f-bf17-345c8416bf6f', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'f84ae24e-f40c-4188-87e4-d94b30dcbfd3', N'student56@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Bui Bao Ngoc', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448614/kkrswfm8ucn0twyfusir.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'e6b369f6-0184-48bf-ac8b-da4f09011519', N'student8@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tô Minh NHật', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'80bcee08-8f14-47fb-b295-dabf025e666a', N'student26@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Craig Mestel', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449201/oicqoqvhdximfgllj7xy.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'8d39c09b-90db-4c29-8f5d-df790e186818', N'admin@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Văn Quân', N'922e5929-2aee-479c-84b1-6910c0f3c116', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'08771c88-c1f3-4c3c-834d-e4c2babac63d', N'student44@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Thomas woodham', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450353/h04fonynjbn6ux16lo2i.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'dc0c7678-bf99-4bd0-9b39-e552e8bb50c0', N'student28@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Jonathan Hunt', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449263/wu5rh1miakpxeattfsv6.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'2181a599-d5d0-4b4f-8f67-e937d3ce4491', N'student60@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Bui Bao Chau', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746448557/yydwqsfxcdmwlefzatqe.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'faf4a0bf-be95-46f2-be8d-eb228b00c67c', N'student13@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Vũ Thị Sinh', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'48421a25-568e-426e-90fb-f07f51ac9df4', N'student20@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Hoang Ngoc Hac', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746450585/zkd1tpvzgjxi3xz8ernb.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'6d6a580c-c72f-411c-816e-fa495e3c2109', N'student10@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Đặng Thị Phan', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'238c70a9-c1b2-4927-8412-fd085456cd3e', N'student29@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Kris KT Thomas', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 1, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746449293/wuyyiycr9anarn2jdgtw.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
INSERT [dbo].[Account] ([account_id], [email], [password], [full_name], [role_id], [fulltime], [phone_number], [dob], [gender], [img_url], [meet_url], [status], [created_at], [updated_at]) VALUES (N'88085fb0-aac6-48a2-8e53-ffec90c71b90', N'student4@gmail.com', N'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lương Thị Dân', N'04eeb9a2-a64e-4ef6-9e2d-8546b4863c8e', 1, N'0123456789', CAST(N'2000-01-01' AS Date), 0, N'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png', NULL, 1, CAST(N'2025-05-01T23:48:38.490' AS DateTime), NULL)
GO

--LecturerSchedule
INSERT INTO LecturerSchedule (lecturer_id, slot_available, weekday_available, updated_at)
SELECT account_id, '1,2,3,4', '2,3,4,5,6,7,8', GETDATE()
FROM Account
WHERE email IN ('lecturer1@gmail.com', 'lecturer2@gmail.com', 'lecturer3@gmail.com');
GO

--Parent
INSERT INTO Parent (student_id, full_name, gender, phone_number, email, status)  VALUES
((SELECT account_id FROM Account WHERE email = 'student1@gmail.com'), N'Nguyễn Văn Hoàng', 1, '0987654321', 'parent1@gmail.com', 1),
((SELECT account_id FROM Account WHERE email = 'student1@gmail.com'), N'Trần Thị Hiền', 0, '0987654321', 'parent2@gmail.com', 1),
((SELECT account_id FROM Account WHERE email = 'student2@gmail.com'), N'Đặng Quang Tuấn', 0, '0964256432', 'parent3@gmail.com', 1);
GO

--data mẫu cho ProfileChangeRequest
INSERT INTO ProfileChangeRequest (account_id, img_url_old, img_url_new, approved_by, description, approved_date, status, created_at) VALUES
((SELECT account_id FROM Account WHERE email = 'student1@gmail.com'),'https://i.imgur.com/McuGRDf.png','https://i.imgur.com/0dTvSSQ.png',NULL,NULL,NULL,0,GETDATE()),
((SELECT account_id FROM Account WHERE email = 'student2@gmail.com'),'https://i.imgur.com/McuGRDf.png','https://i.imgur.com/0dTvSSQ.png',NULL,NULL,NULL,0,GETDATE()),
((SELECT account_id FROM Account WHERE email = 'student3@gmail.com'),'https://i.imgur.com/McuGRDf.png','https://i.imgur.com/0dTvSSQ.png',NULL,NULL,NULL,0,GETDATE()),
((SELECT account_id FROM Account WHERE email = 'student4@gmail.com'),'https://i.imgur.com/McuGRDf.png','https://i.imgur.com/0dTvSSQ.png',(SELECT account_id FROM Account WHERE email = 'officer1@gmail.com'),N'Rejected because student''s profile picture is unclear',GETDATE(),2,GETDATE()),
((SELECT account_id FROM Account WHERE email = 'student5@gmail.com'),'https://i.imgur.com/McuGRDf.png','https://i.imgur.com/0dTvSSQ.png',(SELECT account_id FROM Account WHERE email = 'officer2@gmail.com'),N'Accepted',GETDATE(),1,GETDATE());
GO

--update avatar for user as gender male and female
UPDATE Account
SET img_url = 
    CASE 
        WHEN gender = 0 THEN 'https://res.cloudinary.com/dprozebpx/image/upload/v1746447108/snpdiajryjc7tnyr8z7m.png'  -- Ảnh cho nữ
        WHEN gender = 1 THEN 'https://res.cloudinary.com/dprozebpx/image/upload/v1746447151/robaimov7k2vw3bziobb.png'  -- Ảnh cho nam
        ELSE img_url  -- Giữ nguyên nếu không có giá trị hợp lệ
    END
WHERE img_url IS NULL OR img_url = 'https://ui.shadcn.com/avatars/shadcn.jpg';
GO

-- 18. Thêm dữ liệu mẫu cho Course
--INSERT INTO Course (course_name, description, created_by, status, created_at)
--VALUES 
--(N'IELTS', N'Khóa Học IETLS 2025', (select account_id from account where email = 'officer1@gmail.com'), 1, GETDATE()),
--(N'SAT', N'Khóa học SAT 2025', (select account_id from account where email = 'officer2@gmail.com'), 1, GETDATE());
INSERT [dbo].[Course] ([course_id], [course_name], [description], [created_by], [created_at], [updated_at], [status]) VALUES (N'62f1dea2-7b47-40f2-b1b6-4fb73994d2bc', N'SAT', N'Khóa học SAT 2025', N'e477541b-fa59-4503-a827-82ccbc8f8f5c', CAST(N'2025-05-01T23:48:38.553' AS DateTime), NULL, 1)
INSERT [dbo].[Course] ([course_id], [course_name], [description], [created_by], [created_at], [updated_at], [status]) VALUES (N'55ba39b1-51b2-4643-a5d9-f85b94c73560', N'IELTS', N'Khóa Học IETLS 2025', N'e2025af5-c344-4d9d-9e29-615ba6cf6983', CAST(N'2025-05-01T23:48:38.553' AS DateTime), NULL, 1)

GO

-- 19. Thêm lớp IELTS02-25 và SAT02-25
--INSERT INTO Class (class_code, class_name, lecturer_id, course_id, total_session, start_date, end_date, status, created_at)
--VALUES 
--(N'IELTS25-03/25', N'Lớp IELTS25 Khai Giảng 03-25',(select account_id from account where email = 'lecturer1@gmail.com'), (select course_id from course where course_name = 'IELTS'), 0, GETDATE(), null, 1, GETDATE()),
--(N'SAT25-03/25', N'Lớp SAT25 Khai Giảng 03-25',(select account_id from account where email = 'lecturer2@gmail.com'), (select course_id from course where course_name = 'SAT'), 0, GETDATE(), null, 1, GETDATE());
--GO

INSERT INTO [dbo].[Class] 
VALUES 
(N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'SAT1', N'SAT1', N'6fdf15d2-117c-4139-b699-2aeb5c649a2f', N'62f1dea2-7b47-40f2-b1b6-4fb73994d2bc', 0, CAST(N'2025-05-05T00:00:00.000' AS DateTime), CAST(N'2025-10-14T00:00:00.000' AS DateTime), NULL, CAST(N'2025-05-01T18:47:15.823' AS DateTime), NULL, 2, 0),
(N'01bc2925-93ff-400d-95df-17b725704a80', N'IELTS1', N'IELTS1', N'a61783be-21b7-4727-80d7-9b963f1de010', N'55ba39b1-51b2-4643-a5d9-f85b94c73560', 0, CAST(N'2025-05-01T00:00:00.000' AS DateTime), CAST(N'2025-10-13T00:00:00.000' AS DateTime), NULL, CAST(N'2025-05-01T18:56:39.673' AS DateTime), NULL, 2, 0),
(N'e36fb448-404a-4181-901a-be648487002d', N'SAT2 ', N'SAT2', N'bbd7a1f8-536b-41c2-994e-47884900f25d', N'62f1dea2-7b47-40f2-b1b6-4fb73994d2bc', 0, CAST(N'2025-05-02T00:00:00.000' AS DateTime), CAST(N'2025-10-07T00:00:00.000' AS DateTime), NULL, CAST(N'2025-05-01T18:48:20.897' AS DateTime), NULL, 2, 0),
(N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'IELTS2', N'IELTS2', N'e1a63d43-bdf3-4482-abb8-d8d5202c7f9b', N'55ba39b1-51b2-4643-a5d9-f85b94c73560', 0, CAST(N'2025-05-05T00:00:00.000' AS DateTime), CAST(N'2025-10-14T00:00:00.000' AS DateTime), NULL, CAST(N'2025-05-01T18:59:33.020' AS DateTime), NULL, 2, 0)



-- 20. Xếp học viên vào lớp IELTS01-25
--INSERT INTO ClassStudent (class_id, student_id, status, created_at)
--SELECT 
--    (SELECT class_id FROM Class WHERE class_code = N'IELTS25-03/25'), account_id, 1, GETDATE()
--FROM (
--    SELECT account_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
--    FROM Account 
--    WHERE role_id = (select role_id from role where name = 'Student')
--) AS subquery
--WHERE row_num BETWEEN 1 AND 8;
--GO

-- 21. Xếp học viên vào lớp SAT01-25
--INSERT INTO ClassStudent (class_id, student_id, status, created_at)
--SELECT 
--    (SELECT class_id FROM Class WHERE class_code = N'SAT25-03/25'), account_id, 1, GETDATE()
--FROM (
--    SELECT account_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
--    FROM Account 
--    WHERE role_id = (select role_id from role where name = 'Student')
--) AS subquery
--WHERE row_num BETWEEN 9 AND 16;
GO
SET IDENTITY_INSERT [dbo].[ClassStudent] ON 
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (34, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'941961d3-3ec1-4bcc-bed4-22ffc1a52baa', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (35, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'7a37f703-31c7-4232-ab7f-a91137cae45d', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (36, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'13de9586-998f-4189-b787-570e298af81b', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (37, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'80bcee08-8f14-47fb-b295-dabf025e666a', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (38, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'ee84ed5c-a35c-482d-a8f6-acdcee7e405d', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (39, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'dc0c7678-bf99-4bd0-9b39-e552e8bb50c0', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (40, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'238c70a9-c1b2-4927-8412-fd085456cd3e', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (41, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'0b570819-2185-4973-bf18-9e85e1db5189', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (42, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'3116d98f-17b5-480d-b578-364bdf1f2570', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (43, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'7b51d1a1-7025-4653-8ef7-9f6100109580', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (44, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'9130f3c1-27f2-4e0c-b859-a080d2e597ee', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (45, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'641fcff5-ca57-4783-b22b-7548eddd09be', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (46, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'150c2f03-6557-4ebe-8750-986b80391c67', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (47, N'1f85daa6-421f-4e9c-9759-0a96fe8fddc0', N'1a5be7b0-cfa7-4273-9108-7ffec0fbbd6c', CAST(N'2025-05-01T18:52:24.493' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (48, N'e36fb448-404a-4181-901a-be648487002d', N'9bd08a19-54b6-48fb-8454-1a31ae54a02a', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (49, N'e36fb448-404a-4181-901a-be648487002d', N'3707aa7a-38de-4ef7-ab1e-b741728826d1', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (50, N'e36fb448-404a-4181-901a-be648487002d', N'aebf1e1a-3669-409e-b261-be3bf2588885', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (51, N'e36fb448-404a-4181-901a-be648487002d', N'7108b28e-50a9-4d44-8a28-b2d51caf496f', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (52, N'e36fb448-404a-4181-901a-be648487002d', N'1700b7b1-cda0-4e1c-9110-42efafc558cf', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (53, N'e36fb448-404a-4181-901a-be648487002d', N'd9870741-8e53-41ac-b39b-0b640ac7f2e7', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (54, N'e36fb448-404a-4181-901a-be648487002d', N'a14f544f-8009-444a-9c83-d4bf423c64c6', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (55, N'e36fb448-404a-4181-901a-be648487002d', N'08771c88-c1f3-4c3c-834d-e4c2babac63d', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (56, N'e36fb448-404a-4181-901a-be648487002d', N'6fd897e9-8a0a-4b66-9f37-1d667dcc4518', CAST(N'2025-05-01T18:54:27.757' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (57, N'01bc2925-93ff-400d-95df-17b725704a80', N'fa24b2da-f617-449b-8067-4eb4f2faf857', CAST(N'2025-05-01T18:57:38.550' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (58, N'01bc2925-93ff-400d-95df-17b725704a80', N'3356a40d-5f23-4ad7-b0c0-b9a5d97d8060', CAST(N'2025-05-01T18:57:38.550' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (59, N'01bc2925-93ff-400d-95df-17b725704a80', N'f69c9efc-c28a-43b9-9246-6fcc7aa65792', CAST(N'2025-05-01T18:57:38.550' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (60, N'01bc2925-93ff-400d-95df-17b725704a80', N'48421a25-568e-426e-90fb-f07f51ac9df4', CAST(N'2025-05-01T18:57:38.550' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (61, N'01bc2925-93ff-400d-95df-17b725704a80', N'2c43d71e-0ad3-41bf-a196-063f13f74152', CAST(N'2025-05-01T18:57:38.550' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (62, N'01bc2925-93ff-400d-95df-17b725704a80', N'5ab58f9e-1b13-4b0f-bf36-c56f078a39f7', CAST(N'2025-05-01T18:57:38.550' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (74, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'dc2436df-4bd7-4eda-afa2-a81286185a51', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (75, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'6ba4aa04-8c16-42c5-b575-00fa7a8c8c5f', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (76, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'188d05ac-14c1-4511-8d82-0eab1052f63f', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (77, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'4d536691-c92d-4475-a56f-1d965458f4ee', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (78, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'9c990194-26f8-4731-a6b7-25e1d45b9b11', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (79, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'f1e7f9ca-1b11-4906-931d-a9d7eefa4d0d', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (80, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'd7feecd5-130d-4f88-bb40-b133cb4c5232', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (81, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'096f1fd5-d019-45eb-9664-14d8dff790d1', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (82, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'0d1b1484-cd6a-4cff-b35c-50084408d324', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (83, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'81adf257-7ff8-49de-9808-ba4aecc7d16b', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
INSERT [dbo].[ClassStudent] ([class_student_id], [class_id], [student_id], [created_at], [updated_at], [status]) VALUES (84, N'b797dc62-5c69-4fab-b3e6-efdc3075d296', N'5877bc4d-92f7-4425-8b51-6e67efb8c4f3', CAST(N'2025-05-05T23:29:09.677' AS DateTime), NULL, 1)
SET IDENTITY_INSERT [dbo].[ClassStudent] OFF
GO



