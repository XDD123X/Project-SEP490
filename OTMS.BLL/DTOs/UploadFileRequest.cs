using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace OTMS.BLL.DTOs
{
    public class UploadFileRequest
    {
        public IFormFile File { get; set; }
        public string SessionId { get; set; }
        public string Type { get; set; }
    }
}
