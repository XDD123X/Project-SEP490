using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AddProfileChangeRequestModel
    {
        public Guid AccountId { get; set; }

        public string ImgUrlOld { get; set; } = null!;

        public string ImgUrlNew { get; set; } = null!;
    }
}
