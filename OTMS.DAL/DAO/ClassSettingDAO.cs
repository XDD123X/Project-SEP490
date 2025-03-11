using OTMS.BLL.Models;

namespace OTMS.DAL.DAO
{
    public class ClassSettingDAO : GenericDAO<ClassSetting>
    {
        public ClassSettingDAO(OtmsContext context) : base(context) { }
    }
}