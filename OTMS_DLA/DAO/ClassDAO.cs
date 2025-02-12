using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.DAO
{
    public class ClassDAO
    {
        private readonly OtmsContext _context;

        public ClassDAO(OtmsContext context)
        {
            _context = context;
        }

    }
}
