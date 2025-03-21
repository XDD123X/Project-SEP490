using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;

namespace OTMS.DAL.Repository
{
    public class ParentsRepository : Repository<Parent>, IParentsRepository
    {

        private readonly ParentsDAO _parentsDAO;

        public ParentsRepository(ParentsDAO parentsDAO) : base(parentsDAO)
        {
            _parentsDAO = parentsDAO;
        }

        public async Task<List<Parent>> GetAllParentsAsync()
        {
            return await _parentsDAO.GetAllParentsAsync();
        }
    }
}
