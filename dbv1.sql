USE [master]
GO
/****** Object:  Database [OTMS]    Script Date: 2/4/2025 4:45:27 PM ******/
CREATE DATABASE [OTMS]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'OTMS', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\OTMS.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'OTMS_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\OTMS_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [OTMS] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [OTMS].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [OTMS] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [OTMS] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [OTMS] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [OTMS] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [OTMS] SET ARITHABORT OFF 
GO
ALTER DATABASE [OTMS] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [OTMS] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [OTMS] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [OTMS] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [OTMS] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [OTMS] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [OTMS] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [OTMS] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [OTMS] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [OTMS] SET  ENABLE_BROKER 
GO
ALTER DATABASE [OTMS] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [OTMS] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [OTMS] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [OTMS] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [OTMS] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [OTMS] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [OTMS] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [OTMS] SET RECOVERY FULL 
GO
ALTER DATABASE [OTMS] SET  MULTI_USER 
GO
ALTER DATABASE [OTMS] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [OTMS] SET DB_CHAINING OFF 
GO
ALTER DATABASE [OTMS] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [OTMS] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [OTMS] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [OTMS] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'OTMS', N'ON'
GO
ALTER DATABASE [OTMS] SET QUERY_STORE = ON
GO
ALTER DATABASE [OTMS] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [OTMS]
GO
/****** Object:  Table [dbo].[attendances]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[attendances](
	[attendance_id] [uniqueidentifier] NOT NULL,
	[schedule_id] [uniqueidentifier] NOT NULL,
	[student_id] [uniqueidentifier] NOT NULL,
	[attendance_status] [nvarchar](50) NOT NULL,
	[img_url] [nvarchar](500) NULL,
	[attendance_time] [datetime] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[attendance_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[classes]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[classes](
	[class_id] [uniqueidentifier] NOT NULL,
	[class_code] [nvarchar](50) NOT NULL,
	[class_name] [nvarchar](100) NOT NULL,
	[course_id] [uniqueidentifier] NOT NULL,
	[teacher_id] [uniqueidentifier] NOT NULL,
	[start_date] [datetime] NULL,
	[end_date] [datetime] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[class_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[courses]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[courses](
	[course_id] [uniqueidentifier] NOT NULL,
	[course_name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[course_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[course_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[roles]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[roles](
	[role_id] [uniqueidentifier] NOT NULL,
	[role_name] [nvarchar](50) NOT NULL,
	[description] [nvarchar](255) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[role_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[schedules]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[schedules](
	[schedule_id] [uniqueidentifier] NOT NULL,
	[class_id] [uniqueidentifier] NOT NULL,
	[schedule_date] [datetime] NOT NULL,
	[start_time] [time](7) NOT NULL,
	[end_time] [time](7) NOT NULL,
	[slot] [int] NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[schedule_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[session_records]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[session_records](
	[session_record_id] [uniqueidentifier] NOT NULL,
	[session_id] [uniqueidentifier] NOT NULL,
	[video_url] [nvarchar](500) NULL,
	[description] [nvarchar](255) NULL,
	[uploaded_by] [uniqueidentifier] NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[session_record_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[sessions]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[sessions](
	[session_id] [uniqueidentifier] NOT NULL,
	[schedule_id] [uniqueidentifier] NOT NULL,
	[user_id] [uniqueidentifier] NOT NULL,
	[role_id] [uniqueidentifier] NOT NULL,
	[session_date] [datetime] NOT NULL,
	[status] [int] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[session_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user_types]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user_types](
	[user_type_id] [uniqueidentifier] NOT NULL,
	[user_type_name] [nvarchar](50) NOT NULL,
	[role_id] [uniqueidentifier] NOT NULL,
	[description] [nvarchar](255) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[user_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[user_type_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 2/4/2025 4:45:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[user_id] [uniqueidentifier] NOT NULL,
	[email] [nvarchar](100) NOT NULL,
	[password] [nvarchar](255) NOT NULL,
	[full_name] [nvarchar](100) NOT NULL,
	[role_id] [uniqueidentifier] NOT NULL,
	[user_type_id] [uniqueidentifier] NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[is_active] [int] NULL,
	[Token] [varchar](255) NULL,
	[ResetTokenExpiresAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [idx_attendances_schedule_id]    Script Date: 2/4/2025 4:45:28 PM ******/
CREATE NONCLUSTERED INDEX [idx_attendances_schedule_id] ON [dbo].[attendances]
(
	[schedule_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_session_records_session_id]    Script Date: 2/4/2025 4:45:28 PM ******/
CREATE NONCLUSTERED INDEX [idx_session_records_session_id] ON [dbo].[session_records]
(
	[session_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_users_role_id]    Script Date: 2/4/2025 4:45:28 PM ******/
CREATE NONCLUSTERED INDEX [idx_users_role_id] ON [dbo].[users]
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[attendances] ADD  DEFAULT (newid()) FOR [attendance_id]
GO
ALTER TABLE [dbo].[attendances] ADD  DEFAULT (getdate()) FOR [attendance_time]
GO
ALTER TABLE [dbo].[attendances] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[attendances] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[attendances] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[classes] ADD  DEFAULT (newid()) FOR [class_id]
GO
ALTER TABLE [dbo].[classes] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[classes] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[classes] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[courses] ADD  DEFAULT (newid()) FOR [course_id]
GO
ALTER TABLE [dbo].[courses] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[courses] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[courses] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[roles] ADD  DEFAULT (newid()) FOR [role_id]
GO
ALTER TABLE [dbo].[roles] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[roles] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[roles] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[schedules] ADD  DEFAULT (newid()) FOR [schedule_id]
GO
ALTER TABLE [dbo].[schedules] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[schedules] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[schedules] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[session_records] ADD  DEFAULT (newid()) FOR [session_record_id]
GO
ALTER TABLE [dbo].[session_records] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[session_records] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[session_records] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[sessions] ADD  DEFAULT (newid()) FOR [session_id]
GO
ALTER TABLE [dbo].[sessions] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[sessions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[sessions] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[user_types] ADD  DEFAULT (newid()) FOR [user_type_id]
GO
ALTER TABLE [dbo].[user_types] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[user_types] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[user_types] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (newid()) FOR [user_id]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[attendances]  WITH CHECK ADD FOREIGN KEY([schedule_id])
REFERENCES [dbo].[schedules] ([schedule_id])
GO
ALTER TABLE [dbo].[attendances]  WITH CHECK ADD FOREIGN KEY([student_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[classes]  WITH CHECK ADD FOREIGN KEY([course_id])
REFERENCES [dbo].[courses] ([course_id])
GO
ALTER TABLE [dbo].[classes]  WITH CHECK ADD FOREIGN KEY([teacher_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[schedules]  WITH CHECK ADD FOREIGN KEY([class_id])
REFERENCES [dbo].[classes] ([class_id])
GO
ALTER TABLE [dbo].[session_records]  WITH CHECK ADD FOREIGN KEY([session_id])
REFERENCES [dbo].[sessions] ([session_id])
GO
ALTER TABLE [dbo].[session_records]  WITH CHECK ADD FOREIGN KEY([uploaded_by])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[sessions]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[roles] ([role_id])
GO
ALTER TABLE [dbo].[sessions]  WITH CHECK ADD FOREIGN KEY([schedule_id])
REFERENCES [dbo].[schedules] ([schedule_id])
GO
ALTER TABLE [dbo].[sessions]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[user_types]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[roles] ([role_id])
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD FOREIGN KEY([role_id])
REFERENCES [dbo].[roles] ([role_id])
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD FOREIGN KEY([user_type_id])
REFERENCES [dbo].[user_types] ([user_type_id])
GO
USE [master]
GO
ALTER DATABASE [OTMS] SET  READ_WRITE 
GO
