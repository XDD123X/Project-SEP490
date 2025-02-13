using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
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
            CreateMap<Class, ClassDTO>()
                .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course.CourseName))
                .ReverseMap();
        }
    }
}
