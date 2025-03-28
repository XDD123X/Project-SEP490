using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Officer_Endpoint
{

    [Route("api/Officer/[controller]")]
    [ApiController]
    public class ReportController : OfficerPolicyController
    {
        private readonly IReportRepository _reportRepository;

        private readonly IMapper _mapper;

        public ReportController(IMapper mapper, IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _reportRepository.GetAllReports();
            return Ok(reports);
        }

    }
}
