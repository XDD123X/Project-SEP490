import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle2, Cog, CogIcon, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetClassList } from "@/services/classService";
import { toast } from "sonner";
import CalendarSelector from "@/components/CalendarSelector";
import { addSessionValid, addSingleSession, getSessionsByClassId } from "@/services/sessionService";

export default function OfficerAddSessionPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    classId: "",
    lecturer: null,
    slot: "",
    sessionDate: null,
    description: "",
  });
  const [isValidated, setIsValidated] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [validationStatus, setValidationStatus] = useState();
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [firstSession, setFirstSession] = useState();
  const [lastSession, setLastSession] = useState();

  //fetch class clist
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetClassList();
        if (response.status === 200) {
          setClasses(response.data);
        }
      } catch (error) {
        toast.error("error loading class data");
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateData = async () => {
      if (formData.classId) {
        try {
          const sessionResponse = await getSessionsByClassId(formData.classId);
          if (sessionResponse.status === 200 && sessionResponse.data.length > 0) {
            const sessions = sessionResponse.data.filter((s) => s.classId.toString() === formData.classId);

            // Sắp xếp các buổi học theo thời gian (giả sử có trường 'startTime' hoặc 'sessionDate')
            const sortedSessions = sessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

            // Cập nhật first và last session
            setFirstSession(sortedSessions[0].sessionDate || null);
            setLastSession(sortedSessions[sortedSessions.length - 1].sessionDate || null);
          }

          // Cập nhật lecturer từ lớp học đã chọn
          const selectedClass = classes.find((c) => c.classId.toString() === formData.classId);
          if (selectedClass) {
            setFormData((prev) => ({
              ...prev,
              lecturer: selectedClass.lecturer,
            }));
          }
        } catch (error) {
          console.error("Error fetching sessions:", error);
        }
      }
    };

    updateData();
  }, [formData.classId, classes]);

  // Reset validation when slot or date changes
  useEffect(() => {
    if (isValidated) {
      setIsValidated(false);
      setValidationStatus(null);
      setValidationMessage("");
    }
  }, [formData.slot, formData.sessionDate]);

  const handleClassChange = (value) => {
    setFormData((prev) => ({ ...prev, classId: value }));
  };

  const handleSlotChange = (value) => {
    setFormData((prev) => ({ ...prev, slot: value }));
  };

  const handleDateChange = (sessionDate) => {
    setFormData((prev) => ({ ...prev, sessionDate }));
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  // Mock validation function - replace with actual API call
  const handleSessionValid = async () => {
    if (!formData.slot || !formData.sessionDate) {
      setValidationStatus("error");
      setValidationMessage("Please select both slot and date");
      return;
    }

    setIsValidating(true);

    try {
      //api
      const response = await addSessionValid(formData.classId, formData.lecturer.accountId, formData.sessionDate, formData.slot);
      const isValid = !response.data.hasConflict || false;

      if (isValid) {
        setValidationStatus("success");
        setValidationMessage("Ready To Create New Session");
        setIsValidated(true);
      } else {
        setValidationStatus("error");
        setValidationMessage(response.data.message);
        setIsValidated(false);
      }
    } catch (error) {
      setValidationStatus("error");
      setValidationMessage("Error validating session. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidated) return;

    try {
      setIsAdding(true);
      //api
      const session = {
        classId: formData.classId,
        lecturerId: formData.lecturer.accountId,
        sessionDate: formData.sessionDate,
        slot: formData.slot,
      };
      const response = await addSingleSession(session);
      console.log(response);

      if (response.status === 200) {
        toast.success("Session Created Successfully");
        navigate("/officer/session");
        setIsAdding(false);
      }
      // Redirect back to sessions list
    } catch (error) {
      setValidationStatus("error");
      setValidationMessage("Error creating session. Please try again.");
      setIsAdding(false);
    }
  };

  const handleBack = () => {
    // navigate("/officer/session");
    navigate(-1)
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4  h-4 wr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>Fill in the details to create a new class session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={formData.classId} onValueChange={handleClassChange} disabled={isValidating}>
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes &&
                        classes.map((cls) => (
                          <SelectItem key={cls.classId} value={cls.classId.toString()}>
                            {cls.classCode}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lecturer">Lecturer</Label>
                  <Input id="lecturer" value={formData.lecturer?.fullName || ""} disabled placeholder="Lecturer will be displayed here" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Slot (1 phần) */}
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="slot">Slot</Label>
                    <Select value={formData.slot} onValueChange={handleSlotChange} disabled={isValidating}>
                      <SelectTrigger id="slot">
                        <SelectValue placeholder="Select a slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((slot) => (
                          <SelectItem key={slot} value={slot.toString()}>
                            Slot {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date (2 phần) */}
                  <div className="space-y-2 col-span-2">
                    <Label>Date</Label>
                    <CalendarSelector selectedDate={formData.sessionDate || undefined} setSelectedDate={handleDateChange} className="w-full" startDate={firstSession || null} endDate={lastSession || null} disable={isValidating} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter session description" value={formData.description} onChange={handleDescriptionChange} rows={4} />
                </div>

                {validationStatus && (
                  <Alert variant={validationStatus === "success" ? "default" : "destructive"}>
                    {validationStatus === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{validationStatus === "success" ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{validationMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" onClick={handleSessionValid} disabled={!formData.slot || !formData.sessionDate || isValidating} variant="outline">
              <Settings className="h-4 w-4 wr-2" />
              {isValidating ? "Validating..." : "Valid Session"}
            </Button>
            <Button type="submit" disabled={!isValidated} onClick={handleSubmit}>
              <Plus className="h-4 w-4 wr-2" />
              Add Session
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
