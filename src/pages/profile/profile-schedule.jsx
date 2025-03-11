import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Define the time slots
const timeSlots = ["Slot 1", "Slot 2", "Slot 3", "Slot 4"]

// Define the days of the week
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function ProfileSchedule() {
  // Create state to track selected days and slots
  const [selectedDays, setSelectedDays] = useState({})
  const [selectedSlots, setSelectedSlots] = useState({})

  // Initialize the state objects
  useState(() => {
    const initialDays  = {}
    const initialSlots = {}

    daysOfWeek.forEach((day) => {
      initialDays[day] = false
    })

    timeSlots.forEach((slot) => {
      initialSlots[slot] = false
    })

    setSelectedDays(initialDays)
    setSelectedSlots(initialSlots)
  })

  // Toggle a day checkbox
  const toggleDay = (day) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }))
  }

  // Toggle a slot checkbox
  const toggleSlot = (slot) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [slot]: !prev[slot],
    }))
  }

  // Check all days
  const checkAllDays = () => {
    const newDays = { ...selectedDays }
    Object.keys(newDays).forEach((day) => {
      newDays[day] = true
    })
    setSelectedDays(newDays)
  }

  // Uncheck all days
  const uncheckAllDays = () => {
    const newDays = { ...selectedDays }
    Object.keys(newDays).forEach((day) => {
      newDays[day] = false
    })
    setSelectedDays(newDays)
  }

  // Check all slots
  const checkAllSlots = () => {
    const newSlots = { ...selectedSlots }
    Object.keys(newSlots).forEach((slot) => {
      newSlots[slot] = true
    })
    setSelectedSlots(newSlots)
  }

  // Uncheck all slots
  const uncheckAllSlots = () => {
    const newSlots = { ...selectedSlots }
    Object.keys(newSlots).forEach((slot) => {
      newSlots[slot] = false
    })
    setSelectedSlots(newSlots)
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Create a schedule from the selected days and slots
    const schedule = {
      days: Object.keys(selectedDays).filter((day) => selectedDays[day]),
      slots: Object.keys(selectedSlots).filter((slot) => selectedSlots[slot]),
    }

    console.log("Submitted schedule:", schedule)
    // Here you would typically send the data to your backend
    alert("Schedule submitted successfully!")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Weekday Card */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={selectedDays[day] || false}
                  onCheckedChange={() => toggleDay(day)}
                />
                <Label htmlFor={`day-${day}`} className="cursor-pointer">
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Card */}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {timeSlots.map((slot) => (
              <div key={slot} className="flex items-center space-x-2">
                <Checkbox
                  id={`slot-${slot}`}
                  checked={selectedSlots[slot] || false}
                  onCheckedChange={() => toggleSlot(slot)}
                />
                <Label htmlFor={`slot-${slot}`} className="cursor-pointer">
                  {slot}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit">Submit Schedule</Button>
      </div>
    </form>
  )
}

