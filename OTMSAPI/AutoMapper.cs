namespace OTMSAPI
{
    using AutoMapper;
    using BusinessObject.DTOs;
    using BusinessObject.Models;

    public class MappingProfile : Profile
    {
        public MappingProfile()
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
