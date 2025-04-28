using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class MonitoringData
    {
        public int RequestCount { get; set; }
        public int ErrorCount { get; set; }
        public int SuccessRate { get; set; }
        public long AverageResponseTime { get; set; }
        public List<string> TopEndpoints { get; set; }
        public int CPUUsage { get; set; }
        public long MemoryUsage { get; set; }
        public int OnlineConnections { get; set; }
        public List<string> AlertLogs { get; set; } // Log cảnh báo nhanh
    }
}
