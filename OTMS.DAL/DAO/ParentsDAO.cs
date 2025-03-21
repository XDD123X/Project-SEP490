using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;

namespace OTMS.DAL.DAO
{
    public class ParentsDAO : GenericDAO<Parent>
    {

        public ParentsDAO(OtmsContext context) : base(context) { }

        public async Task<List<Parent>> GetAllParentsAsync()
        {
            return (await GetAllAsync()).ToList();
        }
    }
}
