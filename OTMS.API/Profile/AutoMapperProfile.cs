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
           .ForMember(dest => dest.CourseId, opt => opt.Ignore());

            CreateMap<Notification, InputNotificationDTO>().ReverseMap();
            CreateMap<Class, ClassDTO>().ReverseMap();
            CreateMap<Account, AccountDTO>().ReverseMap();
            CreateMap<Role, RoleDTO>().ReverseMap();
            CreateMap<Class, ClassDTO>().ReverseMap();
            CreateMap<ClassStudent, ClassStudentDTO>().ReverseMap();
            CreateMap<Session, SessionDTO>().ReverseMap();
            CreateMap<Course, CourseDTO>().ReverseMap();
            CreateMap<LecturerSchedule,  LecturerScheduleDTO>().ReverseMap();
        }
    }
}
