using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessObject.DTOs;
using BusinessObject.Models;

namespace OTMS_DLA.Interface
{
    public interface IUserRepository
    {
        
            public Task<Account> AuthenticateUser(LoginDTO loginDTO);
            public string GenerateJwtToken(Account account, bool rememberMe);
        }
    
}
