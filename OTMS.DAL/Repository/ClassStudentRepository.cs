﻿using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class ClassStudentRepository : Repository<ClassStudent>, IClassStudentRepository
    {
        private readonly ClassStudentDAO _classStudentDAO;

        public ClassStudentRepository(ClassStudentDAO classStudentDAO) : base(classStudentDAO)
        {
            _classStudentDAO = classStudentDAO;
        }
        public Task addStudentIntoClass(Guid classId, List<Guid> listStudentId) => _classStudentDAO.addStudentIntoClass(classId, listStudentId);

        public bool checkStuentInClass(Guid classId, Guid studentId) => _classStudentDAO.checkStuentInClass(classId, studentId);
    }
}
