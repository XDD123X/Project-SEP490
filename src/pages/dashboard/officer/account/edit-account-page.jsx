"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, Pencil, Plus, Save } from "lucide-react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { getAccountById, updateAccount } from "@/services/accountService";
import CalendarSelector from "@/components/CalendarSelector";
import { toast } from "sonner";

export function EditAccountOfficerPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [date, setDate] = useState(undefined);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isAddingParent, setIsAddingParent] = useState(false);
  const navigate = useNavigate();
  const [newParent, setNewParent] = useState({
    fullName: "",
    gender: true,
    phoneNumber: "",
    email: "",
    isAdd: true,
  });

  // Add a new state to track which parent is being edited
  const [isEditingParent, setIsEditingParent] = useState(false);
  const [editingParentIndex, setEditingParentIndex] = useState(-1);

  // Add validation states
  const [errors, setErrors] = useState({
    student: {
      fullName: "",
      phoneNumber: "",
      email: "",
    },
    parent: {
      fullName: "",
      phoneNumber: "",
      email: "",
    },
  });

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

  // Add validation functions
  const validateStudentInfo = () => {
    const newErrors = { ...errors };

    // Validate fullName
    if (!account.fullName || account.fullName.trim() === "") {
      newErrors.student.fullName = "Full name is required";
    } else {
      newErrors.student.fullName = "";
    }

    // Validate phone number
    if (!account.phoneNumber || account.phoneNumber.trim() === "") {
      newErrors.student.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(account.phoneNumber)) {
      newErrors.student.phoneNumber = "Phone number must be 10 digits";
    } else {
      newErrors.student.phoneNumber = "";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!account.email || account.email.trim() === "") {
      newErrors.student.email = "Email is required";
    } else if (!emailRegex.test(account.email)) {
      newErrors.student.email = "Invalid email format";
    } else {
      newErrors.student.email = "";
    }

    setErrors(newErrors);

    // Return true if no errors
    return !newErrors.student.fullName && !newErrors.student.phoneNumber && !newErrors.student.email;
  };

  const validateParentInfo = (parent, index) => {
    const newErrors = { ...errors };
    let isValid = true;

    // Validate fullName
    if (!parent.fullName || parent.fullName.trim() === "") {
      newErrors.parent.fullName = "Full name is required";
      isValid = false;
    } else {
      newErrors.parent.fullName = "";
    }

    // Validate phone number
    if (!parent.phoneNumber || parent.phoneNumber.trim() === "") {
      newErrors.parent.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(parent.phoneNumber)) {
      newErrors.parent.phoneNumber = "Phone number must be 10 digits";
      isValid = false;
    } else {
      newErrors.parent.phoneNumber = "";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!parent.email || parent.email.trim() === "") {
      newErrors.parent.email = "Email is required";
    } else if (!emailRegex.test(parent.email)) {
      newErrors.parent.email = "Invalid email format";
    } else {
      newErrors.parent.email = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateNewParent = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Validate fullName
    if (!newParent.fullName || newParent.fullName.trim() === "") {
      newErrors.parent.fullName = "Full name is required";
      isValid = false;
    } else {
      newErrors.parent.fullName = "";
    }

    // Validate phone number
    if (!newParent.phoneNumber || newParent.phoneNumber.trim() === "") {
      newErrors.parent.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(newParent.phoneNumber)) {
      newErrors.parent.phoneNumber = "Phone number must be 10 digits";
      isValid = false;
    } else {
      newErrors.parent.phoneNumber = "";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newParent.email || newParent.email.trim() === "") {
      newErrors.parent.email = "Email is required";
      console.log(newParent);
      isValid = false;
    } else if (!emailRegex.test(newParent.email)) {
      newErrors.parent.email = "Please enter a valid email address";
      isValid = false;
      console.log(newParent);
    } else {
      newErrors.parent.email = "";
    }

    // if (!emailRegex.test(newParent.email)) {
    //   newErrors.parent.email = "Please enter a valid email address";
    //   isValid = false;
    // } else {
    //   newErrors.parent.email = "";
    // }

    setErrors(newErrors);
    return isValid;
  };

  //submit
  const handleSave = async () => {
    if (!account) return;

    console.log(account);

    // Validate student information
    const isStudentValid = validateStudentInfo();

    // Validate all parents
    let areParentsValid = true;
    if (account.role.name === "Student" && account.parents.length > 0) {
      for (let i = 0; i < account.parents.length; i++) {
        if (!validateParentInfo(account.parents[i], i)) {
          areParentsValid = false;
          break;
        }
      }
    }

    if (!isStudentValid || !areParentsValid) {
      toast.warning("Please fix the validation errors before saving");
      return;
    }

    setIsLoading(true);

    try {
      const updatedAccount = {
        ...account,
        email: newEmail,
        dob: date ? format(date, "yyyy-MM-dd") : account.dob,
      };
      const jsonObject = {
        accountId: account.accountId,
        email: newEmail,
        fullName: account.fullName,
        fullTime: account.fullTime || true,
        phoneNumber: account.phoneNumber,
        dob: date ? format(date, "yyyy-MM-dd") : account.dob,
        gender: account.gender,
        status: account.status,
        parents: account.parents.map((parent) => ({
          fullName: parent.fullName,
          gender: parent.gender,
          phoneNumber: parent.phoneNumber,
          email: parent.email,
        })),
        meetUrl: account.meetUrl,
      };

      // Mock API call
      const response = await updateAccount(jsonObject);

      if (response.status === 200) {
        setAccount(updatedAccount);
        toast.success("Account updated successfully!");
      } else {
        toast.error("Account updated failed!");
        return;
      }
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Failed to update account");
    } finally {
      setIsLoading(false);
    }
  };

  //confirm email change
  const confirmEmailChange = () => {
    // Validate student information
    const isStudentValid = validateStudentInfo();

    if (!isStudentValid) {
      toast.warning("Invalid Email Type");
      return;
    }

    setAccount((prev) => (prev ? { ...prev, email: newEmail } : null));
    setIsEditingEmail(false);
    setIsEmailDialogOpen(false);
  };

  // Modify the handleAddParent function to handle both adding and editing
  const handleParentSave = () => {
    if (!account) return;

    // Validate new parent information
    if (!validateNewParent()) {
      return;
    }

    if (isEditingParent && editingParentIndex >= 0) {
      // Update existing parent
      setAccount((prev) => {
        if (!prev) return null;
        const updatedParents = [...prev.parents];
        updatedParents[editingParentIndex] = { ...newParent };
        return {
          ...prev,
          parents: updatedParents,
        };
      });
    } else {
      // Add new parent
      if (account.parents.length >= 2) return;

      setAccount((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          parents: [...prev.parents, { ...newParent, isAdd: true }], // Thêm isAdd = true
        };
      });
    }

    // Reset states
    setNewParent({
      fullName: "",
      gender: true,
      phoneNumber: "",
      email: "",
    });
    setIsAddingParent(false);
    setIsEditingParent(false);
    setEditingParentIndex(-1);
  };

  // Add a function to handle edit button click
  const handleEditParent = (parent, index) => {
    setNewParent({ ...parent });
    setEditingParentIndex(index);
    setIsEditingParent(true);
    setIsAddingParent(true);
  };

  if (isLoading || !account) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading account information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold uppercase">{account.role.name} Information</h1>
      </div>
      <div className="flex justify-start mt-4">
        <Button size="sm" onClick={() => navigate(`/officer/account/${account.role.name}s`)} className="mr-2">
          <ChevronLeft className="h-4 w-4" />
          Back to {account.role.name}s
        </Button>
      </div>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update {account.role.name.toLowerCase()} account details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Field with Edit Toggle */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="email"
                  // value={isEditingEmail ? newEmail : account.email}
                  // onChange={(e) => setNewEmail(e.target.value)}
                  value={account.email}
                  onChange={(e) => setAccount({ ...account, email: e.target.value })}
                  className={errors.student.fullName ? "flex-1 border-red-500" : "flex-1"}
                  onBlur={validateStudentInfo}
                  disabled={!isEditingEmail}
                />
                {isEditingEmail ? (
                  <Button variant="outline" size="icon" onClick={() => setIsEmailDialogOpen(true)} disabled={errors.student.email ? true : false}>
                    <Save className="h-4 w-4" />
                  </Button>
                ) : (
                  //yes to change
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Edit Email Address</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to edit the email address? This will change the login credentials for this account.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setIsEditingEmail(true)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              {errors.student.email && <p className="text-red-500 text-sm mt-1">{errors.student.email}</p>}
            </div>

            {/* Full Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={account.fullName} onChange={(e) => setAccount({ ...account, fullName: e.target.value })} className={errors.student.fullName ? "border-red-500" : ""} onBlur={validateStudentInfo} />
              {errors.student.fullName && <p className="text-red-500 text-sm mt-1">{errors.student.fullName}</p>}
            </div>

            {/* Role (Disabled) */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={account.role.name} disabled />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" value={account.phoneNumber} onChange={(e) => setAccount({ ...account, phoneNumber: e.target.value })} className={errors.student.phoneNumber ? "border-red-500" : ""} onBlur={validateStudentInfo} />
              {errors.student.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.student.phoneNumber}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <CalendarSelector
                className="w-full"
                selectedDate={new Date(date)}
                setSelectedDate={(newDate) => {
                  setDate(newDate);
                  setAccount((prev) => ({ ...prev, dob: newDate.toISOString().split("T")[0] }));
                }}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={account.gender ? "true" : "false"} onValueChange={(value) => setAccount({ ...account, gender: value === "true" })}>
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
              <Select value={account.status.toString()} onValueChange={(value) => setAccount({ ...account, status: Number.parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Suspended</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="3" disabled>Invited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meet URL (Only for Lecturer) */}
          {account.role.name === "Lecturer" && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="meetUrl">Meet URL</Label>
              <Input id="meetUrl" value={account.meetUrl || ""} onChange={(e) => setAccount({ ...account, meetUrl: e.target.value })} />
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
                onClick={() => {
                  setNewParent({
                    fullName: "",
                    gender: true,
                    phoneNumber: "",
                    email: "",
                  });
                  setIsEditingParent(false);
                  setEditingParentIndex(-1);
                  setIsAddingParent(true);
                }}
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
                      <Button variant="outline" size="sm" onClick={() => handleEditParent(parent, index)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p>{parent.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gender</p>
                        <p>{parent.gender ? "Male" : "Female"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p>{parent.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{parent.email || "-"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No parent information added yet</div>
            )}

            {/* Parent Dialog (for both Add and Edit) */}
            <Dialog open={isAddingParent} onOpenChange={setIsAddingParent}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditingParent ? "Edit Parent Information" : "Add Parent Information"}</DialogTitle>
                  <DialogDescription>{isEditingParent ? "Update the details of the student's parent or guardian" : "Enter the details of the student's parent or guardian"}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-parent-name">Full Name</Label>
                    <Input id="new-parent-name" value={newParent.fullName} onChange={(e) => setNewParent({ ...newParent, fullName: e.target.value })} className={errors.parent.fullName ? "border-red-500" : ""} />
                    {errors.parent.fullName && <p className="text-red-500 text-sm mt-1">{errors.parent.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-parent-gender">Gender</Label>
                    <Select value={newParent.gender ? "true" : "false"} onValueChange={(value) => setNewParent({ ...newParent, gender: value === "true" })}>
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
                    <Input id="new-parent-phone" value={newParent.phoneNumber} onChange={(e) => setNewParent({ ...newParent, phoneNumber: e.target.value })} className={errors.parent.phoneNumber ? "border-red-500" : ""} />
                    {errors.parent.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.parent.phoneNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-parent-email">Email</Label>
                    <Input id="new-parent-email" value={newParent.email} onChange={(e) => setNewParent({ ...newParent, email: e.target.value })} className={errors.parent.email ? "border-red-500" : ""} />
                    {errors.parent.email && <p className="text-red-500 text-sm mt-1">{errors.parent.email}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingParent(false);
                      setIsEditingParent(false);
                      setEditingParentIndex(-1);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleParentSave}>{isEditingParent ? "Save Changes" : "Add Parent"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="">
        <Button onClick={handleSave} disabled={isLoading} className="px-8 w-full">
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
