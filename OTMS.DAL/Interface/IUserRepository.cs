using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IUserRepository
    {
        Task<Account> AuthenticateUser(LoginDTO loginDTO);
        string GenerateJwtToken(Account account, bool rememberMe);
        string GenerateRefreshToken();
        Task<string> RefreshAccessToken(string refreshToken);
    }
}
