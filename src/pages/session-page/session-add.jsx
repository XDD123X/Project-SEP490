"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const classList = [
  { id: "IELTS1", name: "IELTS Level 1", sessionsPerWeek: 2 },
  { id: "IELTS2", name: "IELTS Level 2", sessionsPerWeek: 2 },
  { id: "IELTS3", name: "IELTS Level 3", sessionsPerWeek: 3 },
];

const teacherList = [
  { id: 1, name: "Mr. John Doe" },
  { id: 2, name: "Ms. Alice Smith" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const classDays = {
  IELTS1: ["Monday", "Thursday"],
  IELTS2: ["Tuesday", "Friday"],
  IELTS3: ["Monday", "Wednesday", "Friday"],
};

export default function SessionAddPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [preferredDays, setPreferredDays] = useState([]);
  const [startDate, setStartDate] = useState();
  const [sessions, setSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (day) => {
    setPreferredDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = () => {
    if (!selectedClass || !startDate) {
      toast.error("Please select all required fields");
      return;
    }

    const selectedClassInfo = classList.find((c) => c.id === selectedClass);
    if (!selectedClassInfo) return;

    const days = classDays[selectedClass];
    const newSessions = [];

    const totalSessions = 8 * selectedClassInfo.sessionsPerWeek;
    const currentDate = new Date(startDate);
    let sessionCount = 0;

    while (sessionCount < totalSessions) {
      const dayName = format(currentDate, "EEEE");
      if (days.includes(dayName)) {
        newSessions.push({
          sessionNumber: sessionCount + 1,
          date: new Date(currentDate),
          day: dayName,
          classId: selectedClass,
          className: selectedClassInfo.name,
        });
        sessionCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSessions(newSessions);
  };

  const handleSave = () => {
    if (sessions.length === 0) {
      toast({
        title: "No sessions to save",
        description: "Please generate sessions first",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Schedule saved",
      description: `Successfully saved ${sessions.length} sessions for ${sessions[0].className}`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Class Session Scheduler</CardTitle>
          <CardDescription>Select a class and start date to generate a schedule of sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teacher</label>
              <Select onValueChange={setSelectedTeacher} defaultValue={selectedTeacher}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teacherList.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Total Sessions</label>
                <Input type="number" value={15} disabled className="mt-1" />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Slots per Day</label>
                <Input type="number" value={4} disabled className="mt-1" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Preferred Days</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {days.map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <Checkbox checked={preferredDays.includes(day)} onCheckedChange={() => handleCheckboxChange(day)} />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setIsOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button className="mt-6 w-full md:w-auto" onClick={handleSubmit}>
            Generate Sessions
          </Button>

          {sessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Generated Sessions for {sessions[0].className}</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.sessionNumber}>
                        <TableCell>{session.sessionNumber}</TableCell>
                        <TableCell>{format(session.date, "PPP")}</TableCell>
                        <TableCell>{session.day}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        {sessions.length > 0 && (
          <CardFooter>
            <Button className="w-full md:w-auto" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Schedule
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
