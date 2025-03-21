﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AccountUpdate
    {
        public Guid AccountId { get; set; }

        public string Email { get; set; } = null!;

        public string FullName { get; set; } = null!;

        public bool? Fulltime { get; set; }

        public string? PhoneNumber { get; set; }

        public DateOnly? Dob { get; set; }

        public bool? Gender { get; set; }

        public string? MeetUrl { get; set; }

        public int Status { get; set; }

        public virtual ICollection<ParentDTO> Parents { get; set; } = new List<ParentDTO>();


    }
}
