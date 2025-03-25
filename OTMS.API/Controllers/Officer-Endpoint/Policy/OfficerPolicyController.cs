using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Policy = "OfficerOnly")]
    public class OfficerPolicyController : ControllerBase
    {
    }
}
