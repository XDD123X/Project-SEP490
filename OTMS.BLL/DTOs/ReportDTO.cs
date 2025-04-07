using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OTMS.BLL.DTOs
{
    public class ReportDTO
    {

        public Guid RecordId { get; set; }
        public Guid SessionId { get; set; }
        public string analysis_data { get; set; }
        public Guid Generated_By { get; set; }



    }
}
