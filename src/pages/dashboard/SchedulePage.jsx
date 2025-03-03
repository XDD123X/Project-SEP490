"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Filter, Moon, Sun, Smartphone, Monitor } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to get next Thursday or Monday
const getNextSessionDate = (date) => {
  const dayOfWeek = date.getDay();
  let daysToAdd = 0;
  if (dayOfWeek <= 4) {
    // Sunday to Thursday
    daysToAdd = 4 - dayOfWeek; // Next Thursday
  } else {
    daysToAdd = 8 - dayOfWeek; // Next Monday
  }
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + daysToAdd);
  return nextDate;
};

// Generate 18 sessions starting from the next Monday or Thursday
const generateSessions = () => {
  const startDate = getNextSessionDate(new Date());
  return Array.from({ length: 18 }, (_, i) => {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() + i * (i % 2 === 0 ? 3 : 4)); // Alternate between 3 and 4 days (Mon-Thu)

    const status = ["not yet", "absent", "attended"][Math.floor(Math.random() * 3)];

    return {
      id: i + 1,
      date: sessionDate,
      time: sessionDate.getDay() === 1 ? "18:00 - 20:00" : "19:00 - 21:00", // Monday or Thursday
      className: "IELTS25-Q1",
      teacher: "Nguyen Quang",
      meetLink: "https://meet.google.com/abc-defg-hij",
      status,
      notes: status === "absent" ? "Student informed in advance" : "",
    };
  });
};

const sessions = generateSessions();

export default function SchedulePage() {
  const [view, setView] = useState("time-table");
  const [filterStatus, setFilterStatus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const filteredSessions = filterStatus.length > 0 ? sessions.filter((session) => filterStatus.includes(session.status)) : sessions;

  const weekSessions = filteredSessions.filter((session) => session.date >= weekStart && session.date <= weekEnd);

  const uniqueStatuses = Array.from(new Set(sessions.map((session) => session.status)));

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["09:00 - 10:30", "11:00 - 12:30", "14:00 - 15:30", "16:00 - 17:30"];

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const toggleLayout = () => {
    setIsMobileLayout(!isMobileLayout);
  };

  const renderComputerLayout = () => (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="flex bg-muted dark:bg-gray-700 rounded-t-md">
          <div className="w-20 flex-shrink-0 p-2 text-center text-sm font-medium dark:text-white">Time</div>
          {weekdays.map((day) => (
            <div key={day} className="flex-1 p-2 text-center text-sm font-medium dark:text-white">
              {day}
            </div>
          ))}
        </div>
        {timeSlots.map((slot) => (
          <div key={slot} className="flex bg-background dark:bg-gray-800">
            <div className="w-20 flex-shrink-0 p-2 text-center text-xs border-b border-r border-muted dark:border-gray-700 dark:text-gray-300">{slot}</div>
            {weekdays.map((day, dayIndex) => {
              const sessionForSlot = weekSessions.find((session) => session.date.getDay() === (dayIndex + 1) % 7 && session.time === slot);
              return (
                <div key={`${day}-${slot}`} className="flex-1 p-2 min-h-[80px] border-b border-r border-muted dark:border-gray-700" onClick={() => sessionForSlot && handleSessionClick(sessionForSlot)}>
                  {sessionForSlot && (
                    <div
                      className={`text-xs p-1 rounded border-l-2 h-full flex flex-col justify-between cursor-pointer
                      ${
                        sessionForSlot.status === "attended"
                          ? "bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400 dark:text-green-100"
                          : sessionForSlot.status === "absent"
                          ? "bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400 dark:text-red-100"
                          : "bg-yellow-100 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-100"
                      }`}
                      title={`${sessionForSlot.className} - ${sessionForSlot.teacher}`}
                    >
                      <span className="font-medium">{sessionForSlot.className}</span>
                      <span>{sessionForSlot.teacher}</span>
                      <span>{sessionForSlot.status}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMobileLayout = () => (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="flex bg-muted dark:bg-gray-700 rounded-t-md">
          <div className="w-20 flex-shrink-0 p-2 text-center text-sm font-medium dark:text-white">Day</div>
          {timeSlots.map((slot) => (
            <div key={slot} className="flex-1 p-2 text-center text-sm font-medium dark:text-white">
              {slot}
            </div>
          ))}
        </div>
        {weekdays.map((day, dayIndex) => (
          <div key={day} className="flex bg-background dark:bg-gray-800">
            <div className="w-20 flex-shrink-0 p-2 text-center text-xs border-b border-r border-muted dark:border-gray-700 dark:text-gray-300">{day}</div>
            {timeSlots.map((slot) => {
              const sessionForSlot = weekSessions.find((session) => session.date.getDay() === (dayIndex + 1) % 7 && session.time === slot);
              return (
                <div key={`${day}-${slot}`} className="flex-1 p-2 min-h-[80px] border-b border-r border-muted dark:border-gray-700" onClick={() => sessionForSlot && handleSessionClick(sessionForSlot)}>
                  {sessionForSlot && (
                    <div
                      className={`text-xs p-1 rounded border-l-2 h-full flex flex-col justify-between cursor-pointer
                      ${
                        sessionForSlot.status === "attended"
                          ? "bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400 dark:text-green-100"
                          : sessionForSlot.status === "absent"
                          ? "bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400 dark:text-red-100"
                          : "bg-yellow-100 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-100"
                      }`}
                      title={`${sessionForSlot.className} - ${sessionForSlot.teacher}`}
                    >
                      <span className="font-medium">{sessionForSlot.className}</span>
                      <span>{sessionForSlot.teacher}</span>
                      <span>{sessionForSlot.status}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-full sm:max-w-6xl px-2 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Class Timetable</h1>
          <p className="text-muted-foreground dark:text-gray-400">Schedule for IELTS25-Q1 class</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {filterStatus.length > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                    {filterStatus.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {uniqueStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filterStatus.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilterStatus((prev) => [...prev, status]);
                    } else {
                      setFilterStatus((prev) => prev.filter((s) => s !== status));
                    }
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={toggleLayout}>
            {isMobileLayout ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Card className="dark:bg-gray-600">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button onClick={handlePreviousWeek} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
              <Button onClick={handleNextWeek} variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <Tabs defaultValue="time-table" value={view} onValueChange={setView} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="time-table">Time Table</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <TabsContent value="time-table">{isMobileLayout ? renderMobileLayout() : renderComputerLayout()}</TabsContent>
            <TabsContent value="list">
              <div className="grid gap-4">
                {weekSessions.map((session) => (
                  <Card key={session.id} className="cursor-pointer dark:bg-gray-700" onClick={() => handleSessionClick(session)}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg dark:text-white">{session.className}</CardTitle>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">Session {session.id}</p>
                        </div>
                        <Badge
                          className={
                            session.status === "attended"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : session.status === "absent"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                          <span className="dark:text-gray-300">
                            {session.date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                          <span className="dark:text-gray-300">{session.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground dark:text-gray-400">Teacher:</span>
                          <span className="dark:text-gray-300">{session.teacher}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {selectedSession?.className} - Session {selectedSession?.id}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedSession?.date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium dark:text-gray-300">Time:</span>
              <span className="col-span-3 dark:text-gray-300">{selectedSession?.time}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium dark:text-gray-300">Teacher:</span>
              <span className="col-span-3 dark:text-gray-300">{selectedSession?.teacher}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium dark:text-gray-300">Status:</span>
              <span className="col-span-3 dark:text-gray-300">{selectedSession?.status}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium dark:text-gray-300">Meet:</span>
              <a href={selectedSession?.meetLink} target="_blank" rel="noopener noreferrer" className="col-span-3 text-blue-500 hover:underline dark:text-blue-400">
                Click here
              </a>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right font-medium dark:text-gray-300">Notes:</span>
              <span className="col-span-3 dark:text-gray-300">{selectedSession?.notes || "No notes"}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
