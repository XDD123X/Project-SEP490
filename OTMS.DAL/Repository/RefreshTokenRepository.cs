using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {

        private readonly RefreshTokenDAO _refreshTokenDAO;

        public RefreshTokenRepository(RefreshTokenDAO refreshTokenDAO)
        {
            _refreshTokenDAO = refreshTokenDAO;
        }

        public Task<RefreshToken> GetByTokenAsync(string token) => _refreshTokenDAO.GetByTokenAsync(token);

        public Task AddAsync(string refreshToken, Guid accountId) => _refreshTokenDAO.AddAsync(refreshToken, accountId);

        public Task DeleteAsync(RefreshToken refreshToken) => _refreshTokenDAO.DeleteAsync(refreshToken);

        public Task RevokeByUserIdAsync(Guid accountId) => _refreshTokenDAO.RevokeByUserIdAsync(accountId);

        public async Task RevokeToken(string token)
        {
            var refreshToken = await _refreshTokenDAO.GetByTokenAsync(token);
            if (refreshToken != null)
            {
                await _refreshTokenDAO.DeleteAsync(refreshToken);
            }
        }

        public async Task<bool> ValidateRefreshToken(string token)
        {
            var refreshToken = await _refreshTokenDAO.GetByTokenAsync(token);
            return refreshToken != null && refreshToken.ExpiresAt > DateTime.Now;
        }

    }
}
