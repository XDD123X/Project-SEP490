import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Pencil, PencilOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GetClassList } from "@/services/classService";
import { getLecturerList } from "@/services/accountService";
import { getCurrentSetting } from "@/services/classSettingService";
import { generateSession } from "@/services/sessionService";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CalendarSelector from "@/components/CalendarSelector";
import { cn } from "@/lib/utils";

const days = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

export default function SessionGeneratePage() {
  const [classList, setClassList] = useState([]);
  const [lecturerList, setLecturerList] = useState([]);
  const [setting, setSetting] = useState();
  const [preferredDays, setPreferredDays] = useState(days.map((day) => day.id));
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [startDate, setStartDate] = useState();
  const [sessions, setSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSelectDisabled, setIsSelectDisabled] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classes = await GetClassList();
        setClassList(classes.data);

        const lecturers = await getLecturerList();
        setLecturerList(lecturers.data);

        const setting = await getCurrentSetting();
        setSetting(setting.data);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  //Update selectedLecturer even selectedClass change
  useEffect(() => {
    if (selectedClass) {
      const foundClass = classList.find((c) => c.classId === selectedClass);
      if (foundClass && foundClass.lecturer) {
        setSelectedLecturer(foundClass.lecturer.accountId);
      } else {
        setSelectedLecturer(null);
      }
    }
  }, [selectedClass, classList]);

  const handleCheckboxChange = (day) => {
    setPreferredDays((prev) => (prev.includes(day.id) ? prev.filter((d) => d !== day.id) : [...prev, day.id]));
  };

  // Function to toggle the disabled state
  const toggleSelectEnabled = () => {
    if (!isSelectDisabled) {
      setIsSelectDisabled(true);
      return;
    }
    setIsConfirmOpen(true);
  };

  //Confirm
  const confirmChange = () => {
    setIsSelectDisabled(false); // Bật chế độ chọn Lecturer
    setIsConfirmOpen(false); // Đóng Dialog
  };

  const handleSubmit = async () => {
    if (!selectedClass || !startDate || !selectedLecturer) {
      toast.error("Please select all required fields");
      return;
    }

    const parsedStartDate = new Date(startDate);
    const currentDate = new Date();

    parsedStartDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (parsedStartDate < currentDate) {
      toast.error("Start Date Cannot Be In The Past");
      return;
    }

    const selectedClassInfo = classList.find((c) => c.classId === selectedClass);
    if (!selectedClassInfo) return;

    const submissionData = {
      classId: selectedClass,
      lecturerId: selectedLecturer,
      startDate: new Date(startDate).toISOString(),
      totalSessions: setting.sessionTotal,
      slotsPerDay: setting.sessionPerWeek,
      slotNumber: setting.slotNumber,
      preferredDays: preferredDays,
    };

    console.log(submissionData);
    try {
      const response = await generateSession(submissionData);

      if (response.status === 200 && response.data) {
        setSessions(response.data.data);
        console.log("set data for sessions:", response.data.data);

        toast.success("Session generated successfully!");
      } else {
        toast.error("Failed to generate session");
      }
    } catch (error) {
      console.error("Error generating session:", error);
      toast.error("An error occurred while generating the session");
    }
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
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((classItem) => (
                    <SelectItem
                      key={classItem.classId}
                      value={classItem.classId}
                      disabled={classItem.scheduled} // Vô hiệu hóa nếu scheduled = true
                    >
                      {classItem.classCode} - {classItem.className}
                      {classItem.scheduled && " ( Scheduled ) "}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lecturer</label>
              <div className="flex flex-col-1 justify-center items-center">
                <Select value={selectedLecturer} onValueChange={setSelectedLecturer} disabled={isSelectDisabled}>
                  <SelectTrigger className="h-10 w-full disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Please Select Class First" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturerList.map((lecturer) => (
                      <SelectItem key={lecturer.accountId} value={lecturer.accountId}>
                        {lecturer.gender === false ? "Ms." : "Mr."} {lecturer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={toggleSelectEnabled} size="icon" variant="outline" className="ml-5 h-10 w-10" disabled={!selectedClass}>
                  {isSelectDisabled ? <Pencil variant="icon" /> : <PencilOff variant="icon" />}
                </Button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Total Sessions */}
              <div className="flex-1">
                <label className="text-sm font-medium">Total Sessions</label>
                <Input type="number" value={setting ? setting.sessionTotal : 0} disabled className="h-10 w-full mt-2" />
              </div>

              {/* Slots Per Week */}
              <div className="flex-1">
                <label className="text-sm font-medium">Slot Per Day</label>
                <Input type="number" value={setting ? setting.sessionPerWeek : 0} disabled className="h-10 w-full mt-2" />
              </div>

              {/* Slot Per Day */}
              <div className="flex-1">
                <label className="text-sm font-medium">Slots Per Week</label>
                <Input type="number" value={setting ? setting.slotNumber : 0} disabled className="h-10 w-full mt-2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              {/* <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-10 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(new Date(startDate), "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        const localDate = new Date(date);
                        localDate.setHours(12, 0, 0, 0);
                        setStartDate(localDate);
                      }
                      setIsOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover> */}
              <CalendarSelector
                selectedDate={startDate}
                setSelectedDate={(date) => {
                  if (date) {
                    const localDate = new Date(date);
                    localDate.setHours(12, 0, 0, 0);
                    setStartDate(localDate);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Preferred Days</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {days.map((day) => (
                  <label key={day.id} className="flex items-center space-x-2">
                    <Checkbox checked={preferredDays.includes(day.id)} onCheckedChange={() => handleCheckboxChange(day)} />
                    <span>{day.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex mt-6">
            <Button
              className={cn("w-full md:w-auto mr-5", sessions.length > 0 ? "hidden" : "")}
              onClick={handleSubmit}
              disabled={sessions.length > 0}
            >
              Generate Sessions
            </Button>
            {sessions.length > 0 && (
              <Button className="w-full md:w-auto" onClick={() => window.location.reload()}>
                Generate New Sessions
              </Button>
            )}
          </div>

          {sessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Generated Sessions for {sessions[0].className}</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Lecturer</TableHead>
                      <TableHead>Date</TableHead>
                      {/* <TableHead>Day</TableHead> */}
                      <TableHead>Slot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{session.class.classCode}</TableCell>
                        <TableCell>
                          {session.lecturer.gender === false ? "Ms." : "Mr."} {session.lecturer.fullName}
                        </TableCell>
                        <TableCell>{format(new Date(session.sessionDate), "EEEE")}, {format(new Date(session.sessionDate), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{session.slot}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Xác Nhận */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Change Lecturer</DialogTitle>
            <p>Do you want to change the class assigned lecturer?</p>
          </DialogHeader>
          <DialogFooter>
            <Button className="mt-3" variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button className="mt-3" onClick={confirmChange}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
