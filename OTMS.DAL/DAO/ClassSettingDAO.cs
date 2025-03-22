using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;

namespace OTMS.DAL.DAO
{
    public class ClassSettingDAO : GenericDAO<ClassSetting>
    {
        public ClassSettingDAO(OtmsContext context) : base(context) { }

        public async Task DeleteClassSettingAsync(int id)
        {
            var cs = await _dbSet.FindAsync(id);
            if (cs != null)
            {
                _dbSet.Remove(cs);
            }
            return;
        }

        public async Task<ClassSetting?> GetClassSettingByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<ClassSetting?> GetLastSettingAsync()
        {
            return await _dbSet.OrderByDescending(cs => cs.UpdatedAt).FirstOrDefaultAsync();
        }
    }
}