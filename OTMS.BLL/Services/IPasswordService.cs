using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.Services
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        string RandomPassword(int length);
    }
}
