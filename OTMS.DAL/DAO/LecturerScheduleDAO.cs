using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class LecturerScheduleDAO
    {
        private readonly OtmsContext _context;
        public LecturerScheduleDAO(OtmsContext context)
        {
            _context = context;
        }

        public async Task<List<LecturerSchedule>> GetAll()
        {
            return await _context.LecturerSchedules
                .Include(ls => ls.Lecturer)
                .ToListAsync();
        }

        // Get LecturerSchedule by ScheduleId
        public async Task<LecturerSchedule?> GetById(Guid scheduleId)
        {
            return await _context.LecturerSchedules
                .Include(ls => ls.Lecturer)
                .FirstOrDefaultAsync(ls => ls.ScheduleId == scheduleId);
        }

        // Get LecturerSchedule by LecturerId
        public async Task<LecturerSchedule?> GetByLecturerId(Guid lecturerId)
        {
            return await _context.LecturerSchedules
                .Where(ls => ls.LecturerId == lecturerId)
                .Include(ls => ls.Lecturer)
                .FirstOrDefaultAsync();
        }

        // Add LecturerSchedule
        public async Task<bool> Create(LecturerSchedule model)
        {
            try
            {
                model.ScheduleId = Guid.NewGuid(); // New GUID
                model.UpdatedAt = DateTime.Now; // Update time

                await _context.LecturerSchedules.AddAsync(model);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi tạo LecturerSchedule: {ex.Message}");
                return false;
            }
        }

        // Update LecturerSchedule
        public async Task<bool> Update(LecturerSchedule update)
        {
            try
            {
                var existingSchedule = await _context.LecturerSchedules.FindAsync(update.ScheduleId);
                if (existingSchedule == null) return false;

                existingSchedule.SlotAvailable = update.SlotAvailable;
                existingSchedule.WeekdayAvailable = update.WeekdayAvailable;
                existingSchedule.UpdatedAt = DateTime.Now;

                _context.LecturerSchedules.Update(existingSchedule);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi cập nhật LecturerSchedule: {ex.Message}");
                return false;
            }
        }

        // Delete LecturerSchedule
        public async Task<bool> Delete(Guid scheduleId)
        {
            try
            {
                var schedule = await _context.LecturerSchedules.FindAsync(scheduleId);
                if (schedule == null) return false;

                _context.LecturerSchedules.Remove(schedule);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error When Delete LecturerSchedule: {ex.Message}");
                return false;
            }
        }
    }

}
