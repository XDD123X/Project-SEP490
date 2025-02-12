using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.DAO
{
    public class ClassDAO : GenericDAO<Class>
    {

        public ClassDAO(OtmsContext context) : base(context) { }
        public async Task<Class?> GetByClassCode(string classCode)
        {
            return await _dbSet.FirstOrDefaultAsync(a => a.ClassCode.Equals(classCode));
        }
    }
}
