using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class ClassSettingRepository : Repository<ClassSetting>, IClassSettingRepository
    {
        private readonly ClassSettingDAO _classSettingDAO;

        public ClassSettingRepository(ClassSettingDAO classSettingDAO): base(classSettingDAO) 
        {
            _classSettingDAO = classSettingDAO;
        }
    }
}
