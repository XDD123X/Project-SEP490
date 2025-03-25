using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlMessage);
        Task SendEmailToMultipleRecipientsAsync(string[] toAddresses, string subject, string htmlMessage);
    }
}
