using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AddStudentModel
    {
        [JsonPropertyName("classId")]
        public Guid ClassId { get; set; }

        [JsonPropertyName("studentIds")]
        public List<Guid> StudentIds { get; set; } = new List<Guid>();
    }
}
