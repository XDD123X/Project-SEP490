import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { startOfWeek, endOfWeek, format } from "date-fns";

export default function CalendarSelector({ selectedWeek, setSelectedWeek, selectedDate, setSelectedDate, className, disable, startDate, endDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(selectedDate || null);
  const safeSelectedDate = selectedDate ?? new Date();
  const [currentMonth, setCurrentMonth] = useState(safeSelectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(safeSelectedDate.getFullYear());
  const [canNext, setNext] = useState(true);
  const [canPrev, setPrev] = useState(true);

  const endYear = endDate ? new Date(endDate).getFullYear() : currentYear;
  const years = Array.from({ length: endYear - 1900 + 1 }, (_, i) => 1900 + i);

  // Cập nhật `date` khi `selectedDate` thay đổi
  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  // Month names
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Handle date selection
  const handleSelectDate = (day) => {
    const selected = new Date(currentYear, currentMonth, day);
    selected.setHours(12, 0, 0, 0); // Đặt giờ để tránh lỗi múi giờ

    if (setSelectedWeek) {
      setSelectedWeek(startOfWeek(selected, { weekStartsOn: 1 }));
    } else if (setSelectedDate) {
      setSelectedDate(selected);
    }

    setDate(selected);
    setIsOpen(false);
  };

  // Navigate to previous month
  const prevMonth = () => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (currentMonth === 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    } else {
      newMonth = currentMonth - 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    updateNavigationAvailability(newMonth, newYear);
  };

  // Navigate to next month
  const nextMonth = () => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (currentMonth === 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    } else {
      newMonth = currentMonth + 1;
    }

    // Chặn nếu năm mới vượt quá endDate Year
    const endYear = new Date(endDate).getFullYear();
    if (newYear > endYear) return;

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    updateNavigationAvailability(newMonth, newYear);
  };

  //check able to next/prev
  const updateNavigationAvailability = (month, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Lấy năm của endDate nếu hợp lệ, nếu không thì dùng currentYear
    const endYear = endDate ? new Date(endDate).getFullYear() : currentYear;

    // Không cho prev nếu tháng hoặc năm nhỏ hơn 1900, hoặc nếu năm bằng năm hiện tại và tháng là tháng 1
    setPrev(year > 1900 || (year === 1900 && month > 0));

    // Không cho next nếu tháng là 12 và năm bằng năm của endDate
    setNext(!(month === 11 && year === endYear));
  };

  // Check if a day is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  // Generate calendar grid
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);

      const isSelected = date && date.getDate() === day && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      const isTodayDate = isToday(day);

      // Chuyển startDate và endDate từ chuỗi ISO thành Date và loại bỏ thời gian
      const startDateObj = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const endDateObj = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      // Kiểm tra nếu dateObj trước startDate hoặc sau endDate
      const isBeforeStart = startDateObj && dateObj < startDateObj;
      const isAfterEnd = endDateObj && dateObj > endDateObj;

      // Thêm giới hạn 7 ngày
      const isInNext7Days = endDateObj && dateObj > endDateObj && dateObj <= new Date(endDateObj).setDate(new Date(endDateObj).getDate() + 7);

      const isDisabled = (isBeforeStart || isAfterEnd) && !isInNext7Days;

      days.push(
        <Button
          key={day}
          variant={isTodayDate ? "secondary" : isInNext7Days ? "outline" : "ghost"} // Nếu trong 7 ngày từ endDate, dùng "outline"
          className={cn("h-8 w-8 p-0 font-normal", isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}
          onClick={() => handleSelectDate(day)}
          disabled={isDisabled}
        >
          {day}
        </Button>
      );
    }

    return days;
  };

  useEffect(() => {
    updateNavigationAvailability(currentMonth, currentYear);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("flex items-center justify-between font-normal", className || "w-[200px]")} disabled={disable}>
          <CalendarIcon className="h-4 w-4 ml-2" />
          <span className="flex-1 text-center">
            {date
              ? format(date, "dd/MM/yyyy") // Hiển thị ngày đã chọn thay vì `selectedDate`
              : selectedWeek
              ? format(selectedWeek, "dd/MM/yyyy")
              : "Select date"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2 gap-2">
              <Select value={currentMonth.toString()} onValueChange={(value) => setCurrentMonth(Number.parseInt(value))}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currentYear.toString()} onValueChange={(value) => setCurrentYear(Number.parseInt(value))}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth} disabled={!canPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth} disabled={!canNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs leading-6 text-muted-foreground">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">{renderCalendarDays()}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
