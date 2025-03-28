import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getSessionBySessionId } from "@/services/sessionService";
import { toast } from "sonner";

export default function RequestChangeLecturerPage() {
  const navigate = useNavigate();
  const { classId, sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newSlot, setNewSlot] = useState("");
  const [checkStatus, setCheckStatus] = useState(null); // null, 'success', 'error'
  const [checkMessage, setCheckMessage] = useState("");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionResponse = await getSessionBySessionId(sessionId);
        if (sessionResponse.status === 200) {
          setSession(sessionResponse.data);
        }
      } catch (error) {
        toast.error("Failed to fetch session data");
      }
    };
    fetchData();
  }, [sessionId]);

  const handleCheck = () => {
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

    // In a real app, this would check against the database for conflicts
    // For this demo, we'll simulate a successful check
    setCheckStatus("success");
    setCheckMessage("The requested change is available");
    setIsSubmitEnabled(true);
  };

  const handleSubmit = () => {
    // In a real app, this would submit the request to the backend
    alert("Change request submitted successfully!");
    navigate(`/officer/request/${classId}`);
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
                      onSelect={setNewDate}
                      className="border rounded-md"
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date <= today;
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
          <Button variant="outline" onClick={() => navigate(`/officer/request/${classId}`)}>
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
    </div>
  );
}
