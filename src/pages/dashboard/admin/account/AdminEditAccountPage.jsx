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

export function AdminEditAccountPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [date, setDate] = useState(undefined);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  const navigate = useNavigate();

  // Add validation states
  const [errors, setErrors] = useState({
    student: {
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
        navigate("/administrator/accounts");
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
        <Button size="sm" onClick={() => navigate(`/administrator/accounts`)} className="mr-2">
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

      {/* Save Button */}
      <div className="">
        <Button onClick={handleSave} disabled={isLoading} className="px-8 w-full">
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
