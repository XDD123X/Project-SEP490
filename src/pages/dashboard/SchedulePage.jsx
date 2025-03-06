import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, isSameDay } from "date-fns";
import { Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Helper function to generate mock data for a specific week
const generateMockSessions = (startDate) => {
  const endDate = endOfWeek(startDate);
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

  const mockSessions = [];
  const classes = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "History", "Literature", "Art", "Music", "Physical Education"];
  const teachers = ["Dr. Smith", "Prof. Johnson", "Dr. Williams", "Prof. Davis", "Dr. Miller", "Prof. Wilson", "Dr. Moore", "Prof. Taylor", "Dr. Anderson", "Coach Thomas"];
  const statuses = ["Confirmed", "Pending", "Cancelled"];

  weekDays.forEach((day) => {
    for (let slot = 1; slot <= 4; slot++) {
      if (Math.random() > 0.8) {
        // 70% chance of having a class
        mockSessions.push({
          id: `${format(day, "yyyyMMdd")}-${slot}`,
          date: day,
          slot: slot,
          class: classes[Math.floor(Math.random() * classes.length)],
          teacher: teachers[Math.floor(Math.random() * teachers.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          note: Math.random() > 0.7 ? "Some note about the class" : undefined,
        });
      }
    }
  });

  return mockSessions;
};

export default function SchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date()));
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setSessions(generateMockSessions(selectedWeek));
  }, [selectedWeek]);

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  // Time slots definition
  const timeSlots = [
    { id: 1, time: "9:00 - 10:00" },
    { id: 2, time: "10:00 - 11:00" },
    { id: 3, time: "14:00 - 15:00" },
    { id: 4, time: "16:00 - 17:00" },
  ];

  // Weekdays for the selected week
  const weekDays = eachDayOfInterval({
    start: selectedWeek,
    end: endOfWeek(selectedWeek),
  });

  const goToPreviousWeek = () => {
    setSelectedWeek((prev) => addWeeks(prev, -1));
  };

  const goToNextWeek = () => {
    setSelectedWeek((prev) => addWeeks(prev, 1));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Class Schedule</h1>
      </div>

      <div className="mb-6">
        <div className="hidden md:flex items-center justify-between mb-4">
          <Button onClick={goToPreviousWeek} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {format(selectedWeek, "d")} - {format(endOfWeek(selectedWeek), "d MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedWeek} onSelect={(date) => date && setSelectedWeek(startOfWeek(date))} initialFocus />
            </PopoverContent>
          </Popover>
          <Button onClick={goToNextWeek} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="md:hidden space-y-2">
          <div className="flex justify-between">
            <Button onClick={goToPreviousWeek} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={goToNextWeek} variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                {format(selectedWeek, "d")} - {format(endOfWeek(selectedWeek), "d MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedWeek} onSelect={(date) => date && setSelectedWeek(startOfWeek(date))} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopSchedule sessions={sessions} onSessionClick={handleSessionClick} weekDays={weekDays} timeSlots={timeSlots} />
      </div>

      {/* Desktop Layout */}
      <div className="block md:hidden">
        <MobileSchedule sessions={sessions} onSessionClick={handleSessionClick} weekDays={weekDays} timeSlots={timeSlots} />
      </div>

      {/* Session Detail Modal */}
      <SessionModal session={selectedSession} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} timeSlots={timeSlots} />
    </div>
  );
}

// Desktop Schedule Component
function DesktopSchedule({ sessions, onSessionClick, weekDays, timeSlots }) {
  const getSessionForDayAndSlot = (day, slotId) => {
    return sessions.find((session) => isSameDay(session.date, day) && session.slot === slotId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border dark:border-gray-700 bg-muted"></th>
            {weekDays.map((day) => (
              <th key={day.toISOString()} className="p-2 border dark:border-gray-700 bg-muted text-center">
                {format(day, "EEE")}
                <br />
                {format(day, "d/M")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.id}>
              <td className="p-2 border dark:border-gray-700 font-medium text-center whitespace-nowrap">Slot {slot.id}</td>
              {weekDays.map((day) => {
                const session = getSessionForDayAndSlot(day, slot.id);
                return (
                  <td key={`${day.toISOString()}-${slot.id}`} className="p-2 border dark:border-gray-700">
                    {session ? (
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors w-40 h-40 flex flex-col" onClick={() => onSessionClick(session)}>
                        <CardContent className="p-3 flex flex-col justify-between flex-grow">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium truncate">{session.class}</div>
                            <div className="text-sm text-muted-foreground truncate">Teacher: {session.teacher}</div>
                          </div>
                          <Badge variant={session.status === "Confirmed" ? "default" : session.status === "Cancelled" ? "destructive" : "outline"} className="w-fit mt-1">
                            {session.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mobile Schedule Component
function MobileSchedule({ sessions, onSessionClick, weekDays, timeSlots }) {
  const [activeDay, setActiveDay] = useState(weekDays[0]);

  const getSessionsForDay = (day) => {
    return sessions.filter((session) => isSameDay(session.date, day)).sort((a, b) => a.slot - b.slot);
  };

  return (
    <div className="min-w-2">
      <Tabs defaultValue={activeDay.toISOString()} onValueChange={(value) => setActiveDay(new Date(value))}>
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start">
          {weekDays.map((day) => (
            <TabsTrigger key={day.toISOString()} value={day.toISOString()} className="flex-shrink-0">
              {format(day, "EEE")}
              <br />
              {format(day, "MMM d")}
            </TabsTrigger>
          ))}
        </TabsList>

        {weekDays.map((day) => (
          <TabsContent key={day.toISOString()} value={day.toISOString()} className="mt-4">
            <h3 className="text-lg font-medium mb-3">{format(day, "EEEE, MMMM d")}</h3>
            <div className="space-y-3">
              {getSessionsForDay(day).length > 0 ? (
                getSessionsForDay(day).map((session) => {
                  const timeSlot = timeSlots.find((slot) => slot.id === session.slot);
                  return (
                    <Card key={session.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onSessionClick(session)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-lg">{session.class}</div>
                            <div className="text-sm text-muted-foreground mt-1">{timeSlot?.time}</div>
                            <div className="text-sm mt-2">Teacher: {session.teacher}</div>
                            {session.note && <div className="text-sm mt-1 text-muted-foreground">Note: {session.note}</div>}
                          </div>
                          <Badge variant={session.status === "Confirmed" ? "default" : session.status === "Cancelled" ? "destructive" : "outline"}>{session.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">No classes scheduled for this day</div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Session Modal Component
function SessionModal({ session, isOpen, onClose, timeSlots }) {
  if (!session) return null;

  const timeSlot = timeSlots.find((slot) => slot.id === session.slot);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{session.class}</DialogTitle>
          <DialogDescription>{format(session.date, "EEEE, MMMM d, yyyy")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Time:</span>
            <span className="col-span-3">{timeSlot?.time}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Teacher:</span>
            <span className="col-span-3">{session.teacher}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Status:</span>
            <span className="col-span-3">
              <Badge variant={session.status === "Confirmed" ? "default" : session.status === "Cancelled" ? "destructive" : "outline"}>{session.status}</Badge>
            </span>
          </div>
          {session.note && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Note:</span>
              <span className="col-span-3">{session.note}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
