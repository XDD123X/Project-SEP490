import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChevronLeft, Pencil, Plus, Save, X } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useParams } from "react-router-dom"
import { getAccountById } from "@/services/accountService"
import CalendarSelector from "@/components/CalendarSelector"

export function EditAccountOfficerPage() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true)
    const [account, setAccount] = useState(null)
    const [isEditingEmail, setIsEditingEmail] = useState(false)
    const [newEmail, setNewEmail] = useState("")
    const [date, setDate] = useState(undefined)
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
    const [isAddingParent, setIsAddingParent] = useState(false)
    const [newParent, setNewParent] = useState({
        fullName: "",
        gender: true,
        phoneNumber: "",
        email: "",
    })


    // Fetch account data
    useEffect(() => {
        const fetchAccount = async () => {
            if (!id) return; // Tránh gọi API nếu không có ID
            try {
                setIsLoading(true);
                const response = await getAccountById(id); // Gọi API lấy dữ liệu
                setAccount(response.data);
                setNewEmail(response.data.email);
                setDate(new Date(response.data.dob));
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu tài khoản:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccount();
    }, [id]);

    const handleSave = async () => {
        if (!account) return

        setIsLoading(true)

        try {
            // In a real app, you would send this to your API
            const updatedAccount = {
                ...account,
                email: newEmail,
                dob: date ? format(date, "yyyy-MM-dd") : account.dob,
            }

            console.log("Saving account:", updatedAccount)

            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Update local state
            setAccount(updatedAccount)
            alert("Account updated successfully!")
        } catch (error) {
            console.error("Error saving account:", error)
            alert("Failed to update account")
        } finally {
            setIsLoading(false)
        }
    }

    const confirmEmailChange = () => {
        setAccount((prev) => (prev ? { ...prev, email: newEmail } : null))
        setIsEditingEmail(false)
        setIsEmailDialogOpen(false)
    }

    const handleAddParent = () => {
        if (!account || account.parents.length >= 2) return

        setAccount((prev) => {
            if (!prev) return null
            return {
                ...prev,
                parents: [...prev.parents, newParent],
            }
        })

        setNewParent({
            fullName: "",
            gender: true,
            phoneNumber: "",
            email: "",
        })

        setIsAddingParent(false)
    }

    const handleBackButton = () => {
        router.back()
    }

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return "Pending"
            case 1:
                return "Active"
            case 2:
                return "Finished"
            case 3:
                return "Invited"
            default:
                return "Unknown"
        }
    }

    if (isLoading || !account) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading account information...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={handleBackButton} className="mr-2">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to {account.role.name}
                </Button>
                <h1 className="text-2xl font-bold">Account Information</h1>
            </div>

            {/* Account Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email Field with Edit Toggle */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="email"
                                    value={isEditingEmail ? newEmail : account.email}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="flex-1"
                                    disabled={!isEditingEmail}
                                />
                                {isEditingEmail ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setNewEmail(account.email)
                                                setIsEditingEmail(false)
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => setIsEmailDialogOpen(true)}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Edit Email Address</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to edit the email address? This will change the login credentials for
                                                    this account.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => setIsEditingEmail(true)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={account.fullName}
                                onChange={(e) => setAccount({ ...account, fullName: e.target.value })}
                            />
                        </div>


                        {/* Role (Disabled) */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" value={account.role.name} disabled />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                value={account.phoneNumber}
                                onChange={(e) => setAccount({ ...account, phoneNumber: e.target.value })}
                            />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            {/* <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                    >
                                        {date ? format(date, "yyyy-MM-dd") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover> */}
                            <CalendarSelector
                                className="w-full"
                                selectedDate={date} // Dùng state 'date'
                                setSelectedDate={(newDate) => {
                                    setDate(newDate); // Cập nhật state 'date'
                                    setAccount((prev) => ({ ...prev, dob: newDate.toISOString().split("T")[0] })); // Cập nhật 'dob' trong account
                                }}
                            /></div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={account.gender ? "true" : "false"}
                                onValueChange={(value) => setAccount({ ...account, gender: value === "true" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Male</SelectItem>
                                    <SelectItem value="false">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={account.status.toString()}
                                onValueChange={(value) => setAccount({ ...account, status: Number.parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Pending</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="2">Finished</SelectItem>
                                    <SelectItem value="3">Invited</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Meet URL (Only for Lecturer) */}
                    {account.role.name === "Lecturer" && (
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="meetUrl">Meet URL</Label>
                            <Input
                                id="meetUrl"
                                value={account.meetUrl || ""}
                                onChange={(e) => setAccount({ ...account, meetUrl: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Confirmation Dialog for Email Change */}
                    <AlertDialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Email Change</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to change the email from {account.email} to {newEmail}?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmEmailChange}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

            {/* Parents Information Card (Only for Students) */}
            {account.role.name === "Student" && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Parents Information</CardTitle>
                                <CardDescription>Manage parent contact details</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingParent(true)}
                                disabled={account.parents.length >= 2}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Parent
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {account.parents.length > 0 ? (
                            <div className="space-y-4">
                                {account.parents.map((parent, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-medium">Parent {index + 1}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`parent-${index}-name`}>Full Name</Label>
                                                <Input
                                                    id={`parent-${index}-name`}
                                                    value={parent.fullName}
                                                    onChange={(e) => {
                                                        const updatedParents = [...account.parents]
                                                        updatedParents[index].fullName = e.target.value
                                                        setAccount({ ...account, parents: updatedParents })
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`parent-${index}-gender`}>Gender</Label>
                                                <Select
                                                    value={parent.gender ? "true" : "false"}
                                                    onValueChange={(value) => {
                                                        const updatedParents = [...account.parents]
                                                        updatedParents[index].gender = value === "true"
                                                        setAccount({ ...account, parents: updatedParents })
                                                    }}
                                                >
                                                    <SelectTrigger id={`parent-${index}-gender`}>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Male</SelectItem>
                                                        <SelectItem value="false">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`parent-${index}-phone`}>Phone Number</Label>
                                                <Input
                                                    id={`parent-${index}-phone`}
                                                    value={parent.phoneNumber}
                                                    onChange={(e) => {
                                                        const updatedParents = [...account.parents]
                                                        updatedParents[index].phoneNumber = e.target.value
                                                        setAccount({ ...account, parents: updatedParents })
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`parent-${index}-email`}>Email</Label>
                                                <Input
                                                    id={`parent-${index}-email`}
                                                    value={parent.email}
                                                    onChange={(e) => {
                                                        const updatedParents = [...account.parents]
                                                        updatedParents[index].email = e.target.value
                                                        setAccount({ ...account, parents: updatedParents })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">No parent information added yet</div>
                        )}


                        {/* Add Parent Dialog */}
                        <Dialog open={isAddingParent} onOpenChange={setIsAddingParent}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Parent Information</DialogTitle>
                                    <DialogDescription>Enter the details of the student's parent or guardian</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-parent-name">Full Name</Label>
                                        <Input
                                            id="new-parent-name"
                                            value={newParent.fullName}
                                            onChange={(e) => setNewParent({ ...newParent, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-parent-gender">Gender</Label>
                                        <Select
                                            value={newParent.gender ? "true" : "false"}
                                            onValueChange={(value) => setNewParent({ ...newParent, gender: value === "true" })}
                                        >
                                            <SelectTrigger id="new-parent-gender">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Male</SelectItem>
                                                <SelectItem value="false">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-parent-phone">Phone Number</Label>
                                        <Input
                                            id="new-parent-phone"
                                            value={newParent.phoneNumber}
                                            onChange={(e) => setNewParent({ ...newParent, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-parent-email">Email</Label>
                                        <Input
                                            id="new-parent-email"
                                            value={newParent.email}
                                            onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddingParent(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddParent}>Add Parent</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </CardContent>
                </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="px-8">
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    )
}

