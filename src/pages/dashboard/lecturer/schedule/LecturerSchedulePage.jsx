/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getSessionByLecturerId } from "@/services/sessionService";
import { useStore } from "@/services/StoreContext";
import { Link } from "react-router-dom";
import CalendarSelector from "@/components/CalendarSelector";
import LecturerClassCard from "@/components/lecturer-session-card";

export default function LecturerSchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { state } = useStore();
  const { user } = state;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getSessionByLecturerId(user.uid);
        setSessions(response.data);
        // setSessions(generateMockSessions(selectedWeek));
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [user.uid]);

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  // Time slots definition
  const timeSlots = [
    { id: 1, time: "9:00 - 10:30" },
    { id: 2, time: "11:00 - 12:30" },
    { id: 3, time: "14:00 - 15:30" },
    { id: 4, time: "16:00 - 17:30" },
  ];

  // Weekdays for the selected week
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek, { weekStartsOn: 1 }),
    end: endOfWeek(selectedWeek, { weekStartsOn: 1 }),
  });

  const goToPreviousWeek = () => {
    setSelectedWeek((prev) => {
      const newWeek = addWeeks(prev, -1);
      setSelectedDate(newWeek); // Đặt selectedDate là ngày đầu tuần mới
      return newWeek;
    });
  };

  const goToNextWeek = () => {
    setSelectedWeek((prev) => {
      const newWeek = addWeeks(prev, 1);
      setSelectedDate(newWeek); // Đặt selectedDate là ngày đầu tuần mới
      return newWeek;
    });
  };

  return (
    <div className="container mx-auto p-4 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Schedule</h1>
      </div>

      <div className="mb-6">
        <div className="hidden md:flex items-center justify-between mb-4">
          <Button onClick={goToPreviousWeek} variant="outline" className="w-28 flex justify-center">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <CalendarSelector className="min-w-[400px] flex justify-between items-center px-4" selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} />
          <Button onClick={goToNextWeek} variant="outline" className="w-28 flex justify-center">
            Next
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
          {/* <CalendarSelector selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} /> */}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopSchedule sessions={sessions} onSessionClick={handleSessionClick} weekDays={weekDays} timeSlots={timeSlots} />
      </div>

      {/* Mobile Layout */}
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
    const session = sessions.find((session) => isSameDay(new Date(session.sessionDate), day) && session.slot === slotId);
    return session;
  };

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="dark:bg-secondary">
            <th className=" p-2 border dark:border-gray-700 "></th>
            {weekDays.map((day) => (
              <th key={day.toISOString()} className="p-2 border dark:border-gray-700 text-center text-sm font-normal">
                {format(day, "EEEE")}
                <br />
                <span>({format(day, "d/M")})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.id}>
              <td className="p-0 border font-normal text-sm text-center whitespace-nowrap">
                Slot {slot.id} <br /> ({slot.time})
              </td>
              {weekDays.map((day) => {
                const session = getSessionForDayAndSlot(day, slot.id);
                return (
                  <td key={`${day.toISOString()}-${slot.id}`} className="p-[6px] border max-w-xs">
                    {session ? <LecturerClassCard session={session} style={{ width: "100%" }} /> : <div className="h-full flex items-center justify-center text-muted-foreground">-</div>}
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
  const [activeDay, setActiveDay] = useState(weekDays[0]); // Luôn lấy ngày đầu tuần

  useEffect(() => {
    setActiveDay(weekDays[0]); // Cập nhật ngày khi tuần thay đổi
  }, [weekDays]);

  const getSessionsForDay = (day) => {
    return sessions.filter((session) => isSameDay(new Date(session.sessionDate), day)).sort((a, b) => a.slot - b.slot);
  };

  return (
    <div className="min-w-2">
      <Tabs value={activeDay.toISOString()} onValueChange={(value) => setActiveDay(new Date(value))}>
        <TabsList className="w-full p-2 overflow-x-auto flex-nowrap justify-start">
          {weekDays.map((day) => (
            <TabsTrigger key={day.toISOString()} value={day.toISOString()} className="flex-shrink-0">
              {format(day, "EEE")}
              <br />
              {format(day, "dd/MM")}
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
                    <Card key={session.sessionId} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onSessionClick(session)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-lg">{session.class.classCode}</div>
                            <div className="text-sm text-muted-foreground mt-1">{timeSlot?.time}</div>
                            <div className="text-sm mt-2">Lecturer: {session.lecturer.fullName}</div>
                            {session.description && <div className="text-sm mt-1 text-muted-foreground">Note: {session.description}</div>}
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
          <DialogTitle>{session.class.classCode}</DialogTitle>
          <DialogDescription>{format(session.sessionDate, "dd/MM/yyyy")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Slot:</span>
            <span className="col-span-3">
              {session.slot}({timeSlot?.time})
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Lecturer:</span>
            <span className="col-span-3">{session.lecturer.fullName}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Meet Url:</span>
            <span className="col-span-3">
              <Link to={session.class.classUrl} target="_blank" className="text-blue-500 underline underline-offset-4">
                {session.class.classUrl}
              </Link>
            </span>
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
              <span className="col-span-3">{session.description}</span>
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
