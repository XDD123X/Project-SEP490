using BusinessObject.DTOs;
using BusinessObject.Models;
using System.Threading.Tasks;

namespace OTMS_DLA.Interface
{
    public interface IUserRepository
    {
        Task<Account> AuthenticateUser(LoginDTO loginDTO);
        string GenerateJwtToken(Account account, bool rememberMe);
        string GenerateRefreshToken();
        Task<string> RefreshAccessToken(string refreshToken);
    }
}
