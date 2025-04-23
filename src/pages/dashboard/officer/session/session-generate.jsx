import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GetClassList } from "@/services/classService";
import { getLecturerList } from "@/services/accountService";
import { getAllSetting, getCurrentSetting } from "@/services/classSettingService";
import { generateSession } from "@/services/sessionService";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CalendarSelector from "@/components/CalendarSelector";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const days = [
  { id: 2, name: "Monday" },
  { id: 3, name: "Tuesday" },
  { id: 4, name: "Wednesday" },
  { id: 5, name: "Thursday" },
  { id: 6, name: "Friday" },
  { id: 7, name: "Saturday" },
  { id: 8, name: "Sunday" },
];

export default function SessionGeneratePage() {
  const [classList, setClassList] = useState([]);
  const [lecturerList, setLecturerList] = useState([]);

  const [settings, setSettings] = useState([]);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const [preferredDays, setPreferredDays] = useState(days.map((day) => day.id));
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [startDate, setStartDate] = useState();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [isSelectDisabled, setIsSelectDisabled] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isEditingTotalSessions, setIsEditingTotalSessions] = useState(false);
  const [tempTotalSessions, setTempTotalSessions] = useState("0");
  const [isConfirmTotalSessionsOpen, setIsConfirmTotalSessionsOpen] = useState(false);

  const [isEditingLecturer, setIsEditingLecturer] = useState(false);
  const [originalLecturer, setOriginalLecturer] = useState("");
  const [totalSessionError, setTotalSessionError] = useState(false);

  // Toggle edit mode for total sessions
  const toggleEditTotalSessions = () => {
    if (isEditingTotalSessions) {
      // Validate and save
      const numValue = Number(tempTotalSessions);
      if (isNaN(numValue) || numValue < 0) {
        setTotalSessionError(true);
        return;
      }

      setTotalSessionError(false);

      // Update the selected setting
      setSelectedSetting((prev) => ({
        ...prev,
        sessionTotal: numValue,
      }));
    }

    setIsEditingTotalSessions(!isEditingTotalSessions);
  };

  //change setting
  const handleSettingChange = (settingId) => {
    const newSetting = settings.find((s) => s.settingId.toString() === settingId);
    if (newSetting) {
      setSelectedSetting({ ...newSetting });
      setTempTotalSessions(newSetting.sessionTotal.toString());
      setIsEditingTotalSessions(false);
      setTotalSessionError(false);
    }
  };

  // Confirm total sessions change
  const confirmTotalSessionsChange = () => {
    // Parse the input value to an integer
    const newSessionTotal = parseInt(tempTotalSessions, 10);

    // Validate input: not NaN and not empty
    if (!isNaN(newSessionTotal) && tempTotalSessions.trim() !== "") {
      if (selectedSetting) {
        setSelectedSetting({
          ...selectedSetting,
          sessionTotal: newSessionTotal, // Update sessionTotal with the new value
        });
        toast.success("Total sessions updated successfully");
      }
      setTotalSessionError(false); // Clear error if valid
      setIsEditingTotalSessions(false);
      setIsConfirmTotalSessionsOpen(false);
    } else {
      setTotalSessionError(true);
      setIsConfirmTotalSessionsOpen(false);
    }
  };

  //fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setisLoading(true);
        const classes = await GetClassList();
        setClassList(classes.data);

        const lecturers = await getLecturerList();
        setLecturerList(lecturers.data);

        const settingResponse = await getAllSetting();
        const filteredSettings = settingResponse.data.filter((setting) => setting.title.toLowerCase() !== "default");
        setSettings(filteredSettings);
        setSelectedSetting(filteredSettings[0]);
        setTempTotalSessions(filteredSettings[0].sessionTotal.toString());

        setisLoading(false);
      } catch (error) {
        toast.error("Failed to load data");
        console.log(error);
        setisLoading(false);
      }
    };

    fetchData();
  }, []);

  //Update selectedLecturer even selectedClass change
  useEffect(() => {
    if (selectedClass) {
      const foundClass = classList.find((c) => c.classId === selectedClass);
      if (foundClass && foundClass.lecturer) {
        setSelectedLecturer(foundClass.lecturer);
      } else {
        setSelectedLecturer(null);
      }
    }
  }, [selectedClass, classList]);

  //change week day select
  const handleCheckboxChange = (day) => {
    setPreferredDays((prev) => (prev.includes(day.id) ? prev.filter((d) => d !== day.id) : [...prev, day.id]));
  };

  //Confirm
  const confirmChange = () => {
    // Save the changes
    setIsEditingLecturer(false);
    setIsSelectDisabled(true);
    setIsConfirmOpen(false);
    toast.success("Lecturer updated successfully");
    // Here you would typically call an API to update the lecturer
  };

  //submit
  const handleSubmit = async () => {
    if (isEditingTotalSessions) {
      toast.error("Please save your changes first");
      return;
    }

    if (!selectedClass || !startDate) {
      toast.error("Please select all required fields");
      return;
    }

    if (!selectedLecturer) {
      toast.error("Your Must Assign Lecturer First");
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
      lecturerId: selectedLecturer.accountId,
      startDate: new Date(startDate).toISOString(),
      totalSessions: selectedSetting.sessionTotal,
      sessionPerWeek: selectedSetting.sessionPerWeek,
      slotNumber: selectedSetting.slotNumber,
      preferredDays: preferredDays,
    };

    console.log(submissionData);

    try {
      setisLoading(true);
      const response = await generateSession(submissionData);

      if (response.status === 200 && response.data) {
        setisLoading(false);
        setSessions(response.data.data);
        toast.success("Session generated successfully!");
      } else if (response.status === 400) {
        toast.warning(response.message);
        setisLoading(false);
      }
    } catch (error) {
      console.log("ac");
      toast.error("Error generating session:", error);
      setisLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10">
          <Spinner />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Class Session Scheduler</CardTitle>
          <CardDescription>Select a class and start date to generate a schedule of sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* hiển thị thông lớp */}
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
            {/* hiển thị thông tin lecturer */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lecturer</label>
              {/* <Select value={selectedLecturer} onValueChange={setSelectedLecturer} disabled={isSelectDisabled}>
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
                </Select> */}
              {}
              <Input value={selectedLecturer ? selectedLecturer.fullName : "N/A"} className="h-10 w-full mt-2" disabled />
            </div>

            {/* hiển thị thông tin class setting */}
            <div className="flex flex-col gap-4">
              {/* Setting Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Level</label>
                <Select value={selectedSetting?.settingId?.toString() ?? ""} onValueChange={handleSettingChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a setting level" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.map((setting) => (
                      <SelectItem key={setting.settingId} value={setting.settingId.toString()}>
                        {setting.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Total Sessions */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium mr-2">Total Sessions</label>
                <div className="flex items-center space-x-2 w-full">
                  <Input value={tempTotalSessions} disabled={!isEditingTotalSessions} onChange={(e) => setTempTotalSessions(e.target.value)} className={`flex-1 h-10 ${totalSessionError ? "border-red-500" : ""}`} />
                  <Button size="icon" className="h-10" onClick={toggleEditTotalSessions}>
                    {isEditingTotalSessions ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                </div>
                {totalSessionError && <p className="text-sm text-red-500 mt-2">Please enter a valid number for total sessions.</p>}
              </div>

              {/* Slots Per Week and Slot Per Day */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Slots Per Week */}
                <div className="flex-1">
                  <label className="text-sm font-medium">Max Sessions/Week</label>
                  <Input type="number" value={selectedSetting?.sessionPerWeek || 0} className="h-10 w-full mt-2" disabled />
                </div>

                {/* Slot Per Day */}
                <div className="flex-1">
                  <label className="text-sm font-medium">Slots/Day</label>
                  <Input type="number" value={selectedSetting?.slotNumber || 0} className="h-10 w-full mt-2" disabled />
                </div>
              </div>
            </div>

            {/* chọn start date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <CalendarSelector
                className="w-full"
                startDate={new Date()}
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
            <Button className={cn("w-full md:w-auto mr-5", sessions.length > 0 ? "hidden" : "")} onClick={handleSubmit} disabled={sessions.length > 0 || isEditingTotalSessions || isEditingLecturer}>
              Generate Sessions
            </Button>
            {sessions.length > 0 && (
              <Button className="w-full md:w-auto" onClick={() => window.location.reload()}>
                Generate New Sessions
              </Button>
            )}
          </div>

          {/* hiển thị danh sách session sau khi tạo */}
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
                        <TableCell>
                          {format(new Date(session.sessionDate), "EEEE")}, {format(new Date(session.sessionDate), "dd/MM/yyyy")}
                        </TableCell>
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
            <p>
              Do you want to change the lecturer from {lecturerList.find((l) => l.accountId === originalLecturer)?.fullName || "None"} to {lecturerList.find((l) => l.accountId === selectedLecturer)?.fullName || "None"}?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => {
                setSelectedLecturer(originalLecturer);
                setIsConfirmOpen(false);
                setIsEditingLecturer(false);
                setIsSelectDisabled(true);
              }}
            >
              Cancel
            </Button>
            <Button className="mt-3" onClick={confirmChange}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Total Sessions Confirmation */}
      <Dialog open={isConfirmTotalSessionsOpen} onOpenChange={setIsConfirmTotalSessionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Total Sessions Change</DialogTitle>
            <p>
              Do you want to change the total number of sessions from {selectedSetting?.sessionTotal} to {tempTotalSessions}?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button className="mt-3" variant="outline" onClick={() => setIsConfirmTotalSessionsOpen(false)}>
              Cancel
            </Button>
            <Button className="mt-3" onClick={confirmTotalSessionsChange}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
