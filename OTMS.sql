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
    record_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Record(record_id),  -- Set NULL khi xóa Record
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
INSERT INTO Role (name, description)
VALUES 
('Administrator', N'Quản lý hệ thống'),
('Lecturer', N'Giảng dạy các lớp học'),
('Student', N'Tham gia lớp học'),
('Officer', N'Quản lý lớp học và lịch học');
GO

-- 17. Thêm dữ liệu mẫu cho Account
INSERT INTO Account ( email, password, full_name, role_id, status, gender, created_at)
VALUES 
( 'admin@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Văn Quân', (select role_id from Role where name = 'Administrator'), 1, 1,  GETDATE()), --password: matkhau123
( 'officer1@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Trần Thị Mai', (select role_id from Role where name = 'Officer'), 1, 0,  GETDATE()), --password: matkhau123
( 'officer2@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phạm Hoàng Nam', (select role_id from Role where name = 'Officer'), 1, 1,  GETDATE()), --password: matkhau123
( 'lecturer1@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lê Thanh Hải', (select role_id from Role where name = 'Lecturer'), 1, 1,  GETDATE()), --password: matkhau123
( 'lecturer2@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Thị Lan', (select role_id from Role where name = 'Lecturer'), 1, 0,  GETDATE()), --password: matkhau123
( 'lecturer3@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Doãn Minh Tài', (select role_id from Role where name = 'Lecturer'), 1, 1,  GETDATE()), --password: matkhau123
( 'student1@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Đỗ Quốc Đạt', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student2@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Bùi Văn Hiện', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student3@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Nguyễn Hoàng Linh', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
( 'student4@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lương Thị Dân', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
( 'student5@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Phan Thanh Khánh', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student6@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Cao Văn Linh', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student7@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tôn Nữ Minh', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
( 'student8@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Tô Minh NHật', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student9@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Huỳnh Văn Trọng', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student10@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Đặng Thị Phan', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
( 'student11@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Hoàng Minh Quân', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student12@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Ngô Văn Danh', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student13@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Vũ Thị Sinh', (select role_id from Role where name = 'Student'), 1, 0,  GETDATE()), --password: matkhau123
( 'student14@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Mai Thanh Tí', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student15@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Lý Minh Ưu', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()), --password: matkhau123
( 'student16@gmail.com', 'fc8d5c17ee6bd893ac3d47583df509da68ada40070b9c9e1890cae52bc62de28', N'Châu Văn Việt', (select role_id from Role where name = 'Student'), 1, 1,  GETDATE()); --password: matkhau123
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
        WHEN gender = 0 THEN 'https://i.imgur.com/0dTvSSQ.png'  -- Ảnh cho nữ
        WHEN gender = 1 THEN 'https://i.imgur.com/McuGRDf.png'  -- Ảnh cho nam
        ELSE img_url  -- Giữ nguyên nếu không có giá trị hợp lệ
    END
WHERE img_url IS NULL OR img_url = 'https://ui.shadcn.com/avatars/shadcn.jpg';
GO

-- 18. Thêm dữ liệu mẫu cho Course
INSERT INTO Course (course_name, description, created_by, status, created_at)
VALUES 
(N'IELTS', N'Khóa Học IETLS 2025', (select account_id from account where email = 'officer1@gmail.com'), 1, GETDATE()),
(N'SAT', N'Khóa học SAT 2025', (select account_id from account where email = 'officer2@gmail.com'), 1, GETDATE());
GO

-- 19. Thêm lớp IELTS02-25 và SAT02-25
INSERT INTO Class (class_code, class_name, lecturer_id, course_id, total_session, start_date, end_date, status, created_at)
VALUES 
(N'IELTS25-03/25', N'Lớp IELTS25 Khai Giảng 03-25',(select account_id from account where email = 'lecturer1@gmail.com'), (select course_id from course where course_name = 'IELTS'), 0, GETDATE(), null, 1, GETDATE()),
(N'SAT25-03/25', N'Lớp SAT25 Khai Giảng 03-25',(select account_id from account where email = 'lecturer2@gmail.com'), (select course_id from course where course_name = 'SAT'), 0, GETDATE(), null, 1, GETDATE());
GO

-- 20. Xếp học viên vào lớp IELTS01-25
INSERT INTO ClassStudent (class_id, student_id, status, created_at)
SELECT 
    (SELECT class_id FROM Class WHERE class_code = N'IELTS25-03/25'), account_id, 1, GETDATE()
FROM (
    SELECT account_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
    FROM Account 
    WHERE role_id = (select role_id from role where name = 'Student')
) AS subquery
WHERE row_num BETWEEN 1 AND 8;
GO

-- 21. Xếp học viên vào lớp SAT01-25
INSERT INTO ClassStudent (class_id, student_id, status, created_at)
SELECT 
    (SELECT class_id FROM Class WHERE class_code = N'SAT25-03/25'), account_id, 1, GETDATE()
FROM (
    SELECT account_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
    FROM Account 
    WHERE role_id = (select role_id from role where name = 'Student')
) AS subquery
WHERE row_num BETWEEN 9 AND 16;
GO



