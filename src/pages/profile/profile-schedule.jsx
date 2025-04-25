import React, { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useStore } from "@/services/StoreContext";
import { toast } from "sonner";
import { AddLecturerSchedule, getLecturerScheduleByLecturerId, UpdateLecturerSchedule } from "@/services/lecturerScheduleService";
import { authMe } from "@/services/authService";
import { cn } from "@/lib/utils";
import { FileText, XCircle } from "lucide-react";

const timeSlots = [
  { label: "Slot 1 (9:00 - 10:30)", value: 1 },
  { label: "Slot 2 (11:00 - 12:30)", value: 2 },
  { label: "Slot 3 (14:00 - 15:30)", value: 3 },
  { label: "Slot 4 (16:00 - 17:30)", value: 4 },
];

// Define the days of the week with values
const daysOfWeek = [
  { label: "Monday", value: 2 },
  { label: "Tuesday", value: 3 },
  { label: "Wednesday", value: 4 },
  { label: "Thursday", value: 5 },
  { label: "Friday", value: 6 },
  { label: "Saturday", value: 7 },
  { label: "Sunday", value: 8 },
];

export default function ProfileSchedule() {
  const [exist, setExist] = useState(null);
  const [selectedDays, setSelectedDays] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});
  const [errors, setErrors] = useState({});
  const { state, dispatch } = useStore();
  const { user } = state;

  //Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getLecturerScheduleByLecturerId(user.uid);
        if (response.status === 200 && response.data) {
          setExist(response.data.scheduleId);
          const { weekdayAvailable, slotAvailable } = response.data;

          // Chuyển danh sách từ API thành object { value: true/false }
          const formattedDays = daysOfWeek.reduce((acc, day) => {
            acc[day.value] = weekdayAvailable.includes(day.value);
            return acc;
          }, {});

          const formattedSlots = timeSlots.reduce((acc, slot) => {
            acc[slot.value] = slotAvailable.includes(slot.value);
            return acc;
          }, {});

          setSelectedDays(formattedDays);
          setSelectedSlots(formattedSlots);
        }
      } catch (error) {
        toast.error("Failed to fetch schedule");
      }
    };
    if (user?.uid) fetchData();
  }, [user]);

  const toggleDay = (dayValue) => {
    setSelectedDays((prev) => ({
      ...prev,
      [dayValue]: !prev[dayValue],
    }));
  };

  const toggleSlot = (slotValue) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [slotValue]: !prev[slotValue],
    }));
  };

  const checkAllDays = () => {
    const newDays = daysOfWeek.reduce((acc, day) => ({ ...acc, [day.value]: true }), {});
    setSelectedDays(newDays);
  };

  const uncheckAllDays = () => {
    setSelectedDays({});
  };

  const checkAllSlots = () => {
    const newSlots = timeSlots.reduce((acc, slot) => ({ ...acc, [slot.value]: true }), {});
    setSelectedSlots(newSlots);
  };

  const uncheckAllSlots = () => {
    setSelectedSlots({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); //clear old errors

    const selectedWeekdays = Object.keys(selectedDays).filter((key) => selectedDays[key]);
    const selectedSlotKeys = Object.keys(selectedSlots).filter((key) => selectedSlots[key]);

    // ✅ Kiểm tra điều kiện
    const newErrors = {};

    if (selectedWeekdays.length < 4) {
      newErrors.week = "You must select at least 4 weekdays.";
    }

    if (selectedSlotKeys.length < 1) {
      newErrors.slot = "You must select at least 1 time slot.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      lecturerId: user.uid,
      weekdayAvailable: selectedWeekdays.map(Number).join(","),
      slotAvailable: selectedSlotKeys.map(Number).join(","),
    };

    try {
      let response;
      if (!exist) {
        response = await AddLecturerSchedule(payload);
        if (response.status === 200) {
          toast.success("Schedule created successfully!");
        }
      } else {
        response = await UpdateLecturerSchedule({ ...payload, scheduleId: exist });
        if (response.status === 200) {
          toast.success("Schedule updated successfully!");
        }
      }

      // ✅ Cập nhật lại thông tin user
      const userResponse = await authMe();
      const updatedUser = {
        uid: userResponse.data.accountId,
        email: userResponse.data.email,
        name: userResponse.data.fullname,
        phone: userResponse.data.phone,
        dob: userResponse.data.dob,
        imgUrl: userResponse.data.imgUrl,
        role: userResponse.data.role,
        schedule: userResponse.data.schedule,
      };

      dispatch({ type: "SET_USER", payload: { user: updatedUser, role: userResponse.data.role } });
    } catch (error) {
      toast.error("An error occurred while submitting schedule.");
    }
  };

  const handleDisable = async () => {
    toast.warning("Canceled All Lecturers Teaching Schedules");

    // Xóa toàn bộ selectedDays và selectedSlots
    const selectedWeekdays = []; // Không chọn ngày nào
    const selectedSlotKeys = []; // Không chọn slot nào

    const payload = {
      lecturerId: user.uid,
      weekdayAvailable: selectedWeekdays.map(Number).join(","), // Mảng rỗng -> Không có ngày nào được chọn
      slotAvailable: selectedSlotKeys.map(Number).join(","), // Mảng rỗng -> Không có slot nào được chọn
    };

    try {
      await UpdateLecturerSchedule({ ...payload, scheduleId: exist });

      // ✅ Cập nhật lại thông tin user
      const userResponse = await authMe();
      const updatedUser = {
        uid: userResponse.data.accountId,
        email: userResponse.data.email,
        name: userResponse.data.fullname,
        phone: userResponse.data.phone,
        dob: userResponse.data.dob,
        imgUrl: userResponse.data.imgUrl,
        role: userResponse.data.role,
        schedule: userResponse.data.schedule,
      };

      dispatch({ type: "SET_USER", payload: { user: updatedUser, role: userResponse.data.role } });
    } catch (error) {
      toast.error("An error occurred while disable lecturer schedule.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" mt-5space-y-2 w-full max-w-4xl ">
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="destructive"
          onClick={() => handleDisable()}
          disabled={Object.keys(selectedDays).length === 0 || !Object.values(selectedDays).some(Boolean) || Object.keys(selectedSlots).length === 0 || !Object.values(selectedSlots).some(Boolean)}
        >
          <XCircle className="w-4 h-4" />
          Disable Teaching
        </Button>
        <Button type="submit">
          <FileText className="w-4 h-4" />
          Submit Schedule
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekdays */}
        <Card className={cn("mt-4", errors.week && "border border-red-500")}>
          <CardHeader>
            <CardTitle>Weekdays</CardTitle>
            <CardDescription>Select the days of the week.</CardDescription>
            {errors.week && <div className="pb-4 text-sm text-red-500">{errors.week}</div>}
            <div className="flex gap-2 mt-4">
              <Button type="button" variant="outline" onClick={checkAllDays}>
                Check All
              </Button>
              <Button type="button" variant="outline" onClick={uncheckAllDays}>
                Uncheck All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox id={`day-${day.value}`} checked={selectedDays[day.value] || false} onCheckedChange={() => toggleDay(day.value)} />
                  <Label htmlFor={`day-${day.value}`} className="cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className={cn("mt-4", errors.slot && "border border-red-500")}>
          <CardHeader>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Select the time slots.</CardDescription>
            {errors.slot && <div className="pb-4 text-sm text-red-500">{errors.slot}</div>}
            <div className="flex gap-2 mt-4">
              <Button type="button" variant="outline" onClick={checkAllSlots}>
                Check All
              </Button>
              <Button type="button" variant="outline" onClick={uncheckAllSlots}>
                Uncheck All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {timeSlots.map((slot) => (
                <div key={slot.value} className="flex items-center space-x-2">
                  <Checkbox id={`slot-${slot.value}`} checked={selectedSlots[slot.value] || false} onCheckedChange={() => toggleSlot(slot.value)} />
                  <Label htmlFor={`slot-${slot.value}`} className="cursor-pointer">
                    {slot.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
