export const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Lấy phần YYYY-MM-DD
};

export const convertToISODate = (dateString) => {
  if (!dateString) return null;

  if (dateString instanceof Date) return dateString; // Nếu đã là Date thì giữ nguyên

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date; // Kiểm tra date hợp lệ
};

export const isToday = (dateString) => {
  const date = convertToISODate(dateString);
  if (!date) return false;

  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
};
