using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken> GetByTokenAsync(string token);
        Task AddAsync(string refreshToken, Guid accountId);
        Task DeleteAsync(RefreshToken refreshToken);
        Task RevokeByUserIdAsync(Guid accountId);

        Task RevokeToken(string refreshToken);
        Task<bool> ValidateRefreshToken(string refreshToken);
    }
}
