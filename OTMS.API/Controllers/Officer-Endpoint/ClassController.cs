using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/officer/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IMapper _mapper;
        private readonly IAccountRepository _accountRepository;

        public ClassController(IClassRepository classRepository, IClassStudentRepository classStudentRepository, IAccountRepository accountRepository, IMapper mapper)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
        }

    }
}
