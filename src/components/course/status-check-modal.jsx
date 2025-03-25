"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function CourseStatusCheckModal({ isOpen, onClose, course, onStatusChange }) {
    const [isInUse, setIsInUse] = useState(null)
    const [selectedStatus, setSelectedStatus] = useState(null)

    // Mock function to check if course is in use
    const checkCourseUsage = () => {
        // Simulate API call to check if course is in use
        // For demo purposes, we'll randomly determine if the course is in use
        const inUse = Math.random() > 0.5
        setIsInUse(inUse)

        // If course is in use, default to pending status
        // If not in use, keep current selection or default to cancelled
        setSelectedStatus(inUse ? 2 : selectedStatus || 0)
    }

    const handleSave = () => {
        if (selectedStatus !== null && course) {
            onStatusChange(selectedStatus)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Check Course Status</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {course && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Course:</span>
                                <span>{course.courseName}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Current Status:</span>
                                <span>
                                    {course.status === 0 && "Cancelled"}
                                    {course.status === 1 && "Active"}
                                    {course.status === 2 && "Pending"}
                                </span>
                            </div>

                            <Button onClick={checkCourseUsage} className="w-full">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Check if course is in use
                            </Button>

                            {isInUse !== null && (
                                <Alert variant={isInUse ? "destructive" : "default"}>
                                    {isInUse ? (
                                        <>
                                            <XCircle className="h-4 w-4" />
                                            <AlertTitle>Course is in use</AlertTitle>
                                            <AlertDescription>
                                                This course is currently being used in classes. You can only set it to Pending status.
                                            </AlertDescription>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertTitle>Course is not in use</AlertTitle>
                                            <AlertDescription>
                                                This course is not being used in any classes. You can set it to Cancelled or Pending.
                                            </AlertDescription>
                                        </>
                                    )}
                                </Alert>
                            )}

                            {isInUse !== null && (
                                <div className="space-y-2">
                                    <div className="font-medium">Change status to:</div>
                                    <RadioGroup
                                        value={selectedStatus?.toString()}
                                        onValueChange={(value) => setSelectedStatus(Number.parseInt(value))}
                                    >
                                        {(!isInUse || course.status === 0) && (
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="0" id="cancelled" disabled={isInUse} />
                                                <Label htmlFor="cancelled">Cancelled</Label>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="1" id="active" />
                                            <Label htmlFor="active">Active</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="2" id="pending" />
                                            <Label htmlFor="pending">Pending</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isInUse === null || selectedStatus === null}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

