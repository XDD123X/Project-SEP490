using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IVideoAnalyze
    {
        Task AnalyzeVideoAsync(Guid sessionId, Guid generateBy);

    }
}
