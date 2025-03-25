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

const timeSlots = [
  { label: "Slot 1", value: 1 },
  { label: "Slot 2", value: 2 },
  { label: "Slot 3", value: 3 },
  { label: "Slot 4", value: 4 },
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

    if (!exist) {
      //create
      const create = {
        lecturerId: user.uid,
        weekdayAvailable: Object.keys(selectedDays)
          .filter((key) => selectedDays[key])
          .map(Number)
          .join(","),
        slotAvailable: Object.keys(selectedSlots)
          .filter((key) => selectedSlots[key])
          .map(Number)
          .join(","),
      };

      try {
        const response = await AddLecturerSchedule(create);

        if (response.status === 200) {
          toast.success("Schedule created successfully!");
        }
      } catch (error) {
        toast.error(error);
      }
    } else {
      //update
      const update = {
        scheduleId: exist,
        lecturerId: user.uid,
        weekdayAvailable: Object.keys(selectedDays)
          .filter((key) => selectedDays[key])
          .map(Number)
          .join(","),
        slotAvailable: Object.keys(selectedSlots)
          .filter((key) => selectedSlots[key])
          .map(Number)
          .join(","),
      };
      try {
        const response = await UpdateLecturerSchedule(update);

        if (response.status === 200) {
          toast.success("Schedule updated successfully!");
        }
      } catch (error) {
        toast.error(error);
      }
    }
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

    const updatedRole = userResponse.data.role;
    dispatch({ type: "SET_USER", payload: { user: updatedUser, role: updatedRole } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekdays */}
        <Card>
          <CardHeader>
            <CardTitle>Weekdays</CardTitle>
            <CardDescription>Select the days of the week.</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Select the time slots.</CardDescription>
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

      <div className="flex justify-center">
        <Button type="submit">Submit Schedule</Button>
      </div>
    </form>
  );
}
