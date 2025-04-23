import { useState, useEffect } from "react";
import { format, isSameDay, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addRequestChangeSession, getSessionBySessionId, requestChangeSessionValid } from "@/services/sessionService";
import { toast } from "sonner";
import { useStore } from "@/services/StoreContext";
import { number } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CalendarSelector from "@/components/CalendarSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RequestChangeLecturerPage() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { user } = state;
  const { classId, sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newSlot, setNewSlot] = useState("");
  const [checkStatus, setCheckStatus] = useState(null); // null, 'success', 'error'
  const [checkMessage, setCheckMessage] = useState("");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionResponse = await getSessionBySessionId(sessionId);
        if (sessionResponse.status === 200) {
          setSession(sessionResponse.data);
          setNewSlot(sessionResponse.data.slot.toString());
        }
      } catch (error) {
        toast.error("Failed to fetch session data");
        console.log(error);
      }
    };
    fetchData();
  }, [sessionId]);

  //handle change date
  const handleDateChange = (date) => {
    if (date) {
      const adjustedDate = new Date(date);
      adjustedDate.setHours(12, 0, 0, 0); // Đặt giữa ngày để tránh lỗi múi giờ
      setNewDate(adjustedDate);
    }
    setIsSubmitEnabled(false);
    setCheckStatus(null);
  };

  const handleCheck = async () => {
    if (!newDate) {
      setCheckStatus("error");
      setCheckMessage("Please select a new date");
      setIsSubmitEnabled(false);
      return;
    }

    if (!newSlot) {
      setCheckStatus("error");
      setCheckMessage("Please select a new slot");
      setIsSubmitEnabled(false);
      return;
    }
    const formattedNewDate = parse(format(newDate, "dd/MM/yyyy"), "dd/MM/yyyy", new Date());
    const formattedSessionDate = parse(format(session.sessionDate, "dd/MM/yyyy"), "dd/MM/yyyy", new Date());
    if (newSlot == session.slot && isSameDay(formattedNewDate, formattedSessionDate)) {
      console.log("111");

      setCheckStatus("error");
      setCheckMessage("Original Schedule");
      setIsSubmitEnabled(false);
      return;
    }

    try {
      const responseCheck = await requestChangeSessionValid(user.uid, newDate.toISOString(), Number.parseInt(newSlot), session?.sessionId);

      if (responseCheck.status === 200) {
        if (responseCheck.data.hasConflict) {
          setCheckStatus("error");
          setCheckMessage(responseCheck.data.message || "The requested slot is not available.");
          setIsSubmitEnabled(false);
        } else {
          setCheckStatus("success");
          setCheckMessage(responseCheck.data.message || "The requested change is available");
          setIsSubmitEnabled(true);
        }
      } else {
        throw new Error(responseCheck.message);
      }
    } catch (error) {
      setCheckStatus("error");
      setCheckMessage(error.message || "An error occurred while checking availability");
      setIsSubmitEnabled(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsOpenDialog(true);
    } catch (error) {
      toast.error("Failed When Validating Schedule.");
    }
  };

  const handleConfirm = async () => {
    const request = {
      lecturerId: user.uid,
      newDate: newDate.toISOString(),
      newSlot: Number.parseInt(newSlot),
      sessionId: session.sessionId,
      description: description,
    };

    try {
      const response = await addRequestChangeSession(request);
      console.log(response);

      if (response.status === 200) {
        toast.success("Request Submitted Successfully.");
        navigate(`/lecturer/request/${classId}`);
        setIsOpenDialog(false);
      }
    } catch (error) {
      console.log(error);
    }
    setIsOpenDialog(false);
  };

  if (!session) return <div className="container mx-auto py-8">Loading...</div>;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Request Session Change</CardTitle>
          <CardDescription>Change the date and time slot for this teaching session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Current Session Details</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Session Number</Label>
                    <p className="font-medium">{session.sessionNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Lecturer</Label>
                    <p className="font-medium">{session.lecturer.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Class Code</Label>
                    <p className="font-medium">{session.class.classCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Date</Label>
                    <p className="font-medium">{format(session.sessionDate, "EEEE, dd/MM/yyyy")}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Slot</Label>
                    <p className="font-medium">Slot {session.slot}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">New Session Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-slot" className="block mb-2">
                      Select New Slot
                    </Label>
                    <RadioGroup id="new-slot" value={newSlot} onValueChange={setNewSlot} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="slot-1" />
                        <Label htmlFor="slot-1">Slot 1 (9:00 AM - 10:30 AM)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="slot-2" />
                        <Label htmlFor="slot-2">Slot 2 (11:00 AM - 12:30 PM)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="slot-3" />
                        <Label htmlFor="slot-3">Slot 3 (14:00 PM - 15:30 PM)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="slot-4" />
                        <Label htmlFor="slot-4">Slot 4 (16:00 PM - 17:30 PM)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="block mb-2">Select New Date</Label>
                    <Calendar
                      mode="single"
                      selected={newDate}
                      onSelect={handleDateChange}
                      className="border rounded-md flex justify-center"
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const sessionDate = new Date(session.sessionDate);
                        sessionDate.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {checkStatus && (
              <Alert variant={checkStatus === "success" ? "default" : "destructive"}>
                {checkStatus === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{checkStatus === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{checkMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(`/lecturer/request/${classId}`)}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button variant="secondary" onClick={handleCheck} disabled={newDate === null ? true : false}>
              Check Availability
            </Button>
            <Button onClick={handleSubmit} disabled={!isSubmitEnabled}>
              Submit Request
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialog Confirmation */}
      {isOpenDialog && (
        <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Session Change</DialogTitle>
              <DialogDescription>Request to change the date and time slot for session #{session.sessionNumber}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 space-y-2">
                  <h3 className="text-sm font-medium">Request Details</h3>
                  <div className="rounded-md bg-muted p-3 text-sm space-y-2">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Date:</span>
                      <span>{format(new Date(session.sessionDate), "EEEE, dd/MM/yyyy")}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>{format(new Date(newDate), "EEEE, dd/MM/yyyy")}</span>
                    </div>

                    {/* Slot */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Slot:</span>
                      <span>{session.slot}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>{newSlot}</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-4 space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Reason for Change
                  </label>
                  <Textarea id="description" name="description" value={description || ""} onChange={(e) => setDescription(e.target.value)} placeholder="Please provide a reason" className="resize-none" rows={3} />
                  <p className="text-xs text-muted-foreground">Please explain why you need to change this session's date and time.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleConfirm}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
