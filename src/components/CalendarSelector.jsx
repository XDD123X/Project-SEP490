import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { startOfWeek, endOfWeek, format } from "date-fns";



export default function CalendarSelector({ selectedWeek, setSelectedWeek, selectedDate, setSelectedDate, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState(selectedDate || null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())


  // Generate array of years (current year - 10 to current year + 10)
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  // Month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

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
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Check if a day is today
  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  // Generate calendar grid
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        date && date.getDate() === day && date.getMonth() === currentMonth && date.getFullYear() === currentYear

      const isTodayDate = isToday(day)

      days.push(
        <Button
          key={day}
          variant={isTodayDate ? "secondary" : "ghost"} // Nếu là hôm nay, dùng secondary
          className={cn(
            "h-8 w-8 p-0 font-normal",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={() => handleSelectDate(day)}
        >
          {day}
        </Button>
      );
    }

    return days
  }


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn(
          "flex items-center justify-between font-normal",
          className || "w-[200px]"
        )}>
          <CalendarIcon className="h-4 w-4 ml-2" />
          <span className="flex-1 text-center">
            {date ? format(date, 'dd/MM/yyyy') : "Select date"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={currentMonth.toString()}
                onValueChange={(value) => setCurrentMonth(Number.parseInt(value))}
              >
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
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
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
