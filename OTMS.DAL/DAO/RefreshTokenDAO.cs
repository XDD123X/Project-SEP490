using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class RefreshTokenDAO
    {
        private readonly OtmsContext _context;
        public RefreshTokenDAO(OtmsContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens.Where(t => t.Token == token && t.Status == 1).FirstOrDefaultAsync();
        }

        public async Task AddAsync(string refreshToken, Guid accountId)
        {
            var token = new RefreshToken()
            {
                Token = refreshToken,
                AccountId = accountId,
                ExpiresAt = DateTime.Now.AddDays(7)

            };

            var exist = await _context.RefreshTokens.Where(t => t.AccountId == accountId && t.Status == 1).FirstOrDefaultAsync();
            if (exist != null)
            {
                exist.Status = 0;
                exist.RevokedAt = DateTime.Now;
            }

            await _context.RefreshTokens.AddAsync(token);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Remove(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task RevokeByUserIdAsync(Guid accountId)
        {
            var tokens = await _context.RefreshTokens.Where(rt => rt.AccountId == accountId).ToListAsync();
            tokens.ForEach(rt => rt.Status = 0);
            await _context.SaveChangesAsync();
        }



    }
}
