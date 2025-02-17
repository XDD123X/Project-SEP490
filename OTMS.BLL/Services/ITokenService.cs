using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(Account account);
        string GenerateRefreshToken();
        Guid? ValidateToken(string token);
    }
}
