﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AddCourseModel
    {
        public string CourseName { get; set; } = null!;

        public string? Description { get; set; }

        public Guid CreatedBy { get; set; }

    }
}
