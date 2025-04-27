using OTMS.API.Controllers.Admin_Endpoint;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using System.Data;
using System.Security.Principal;

namespace OTMS.API.Profile
{
    public class AutoMapperProfile : AutoMapper.Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Account, UserAccountDTO>()
                 .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name))
                 .ForMember(dest => dest.Password, opt => opt.Ignore())
                 .ReverseMap()
                 .ForMember(dest => dest.Role, opt => opt.Ignore());

            CreateMap<CourseDTO, Course>()
           .ForMember(dest => dest.CourseId, opt => opt.Ignore()).ReverseMap();
            CreateMap<Record, UploadRecord>().ReverseMap();
            CreateMap<Notification, InputNotificationDTO>().ReverseMap();
            CreateMap<Class, ClassDTO>().ReverseMap();
            CreateMap<Account, AccountDTO>().ReverseMap();
            CreateMap<Role, RoleDTO>().ReverseMap();
            CreateMap<Class, ClassDTO>().ReverseMap();
            CreateMap<ClassStudent, ClassStudentDTO>().ReverseMap();
            CreateMap<Session, SessionDTO>().ReverseMap();
            CreateMap<Course, CourseDTO>().ReverseMap();
            CreateMap<LecturerSchedule, LecturerScheduleDTO>().ReverseMap();
            CreateMap<Parent, ParentDTO>().ReverseMap();
            CreateMap<Attendance, AttendanceDTO>().ReverseMap();
            CreateMap<Account, ByNavigationDTO>().ReverseMap();
            CreateMap<Notification, NotificationDTO>().ReverseMap();

            //Profile Mapper Config
            CreateMap<ProfileChangeRequest, ProfileChangeRequestDTO>()
                .ForMember(dest => dest.Account, opt => opt.MapFrom(src => new AccountDTO
                {
                    Email = src.Account.Email,
                    FullName = src.Account.FullName,
                    Gender = src.Account.Gender,
                    PhoneNumber = src.Account.PhoneNumber
                }))
                .ForMember(dest => dest.ApprovedByNavigation, opt => opt.MapFrom(src => src.ApprovedByNavigation == null ? null : new AccountDTO
                {
                    Email = src.ApprovedByNavigation.Email,
                    FullName = src.ApprovedByNavigation.FullName,
                    Gender = src.ApprovedByNavigation.Gender,
                    PhoneNumber = src.ApprovedByNavigation.PhoneNumber
                }))
                .ReverseMap();

            //Session Request Config
            CreateMap<SessionChangeRequest, SessionChangeRequestDTO>()
                .ForMember(dest => dest.Lecturer, opt => opt.MapFrom(src => src.Lecturer))
                .ForMember(dest => dest.ApprovedByNavigation, opt => opt.MapFrom(src => src.ApprovedByNavigation))
                .ReverseMap();

        }
    }
}
