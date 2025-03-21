using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;

namespace OTMS.DAL.Interface
{
  public  interface IParentsRepository
    {
        public Task<List<Parent>> GetAllParentsAsync();
    }
}
