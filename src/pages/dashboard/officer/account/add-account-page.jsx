import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import CalendarSelector from "@/components/CalendarSelector";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { addAccount } from "@/services/accountService";

export default function AddAccountOfficerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    gender: "",
    dob: "",
    role: "",
    fulltime: true,
  });

  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Name validation
    if (!formData.fullName) {
      newErrors.fullName = "Name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Phone validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone is required";
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/[^0-9]/g, ""))) {
      newErrors.phoneNumber = "Phone number is invalid";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // DOB validation
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If role changes to student, set fullTime to true
    // if (field === "role" && value === "student") {
    //   newData.fulltime = "true";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = async () => {
    // setIsSubmitting(true);

    // Format lại dữ liệu trước khi gửi API
    const formattedData = {
      ...formData,
      gender: formData.gender === "male",
    };

    console.log("json: ", formattedData);

    try {
      // Gọi API để thêm tài khoản
      const response = await addAccount(formattedData);

      if (response.status === 200) {
        toast.success("Account created successfully!");
        setShowConfirmation(false);

        // Điều hướng đến trang account/id
        navigate(`/account/${response.data.accountId}`);

        // Reset form sau khi thành công
        setFormData({
          email: "",
          fullName: "",
          phoneNumber: "",
          gender: "",
          dob: "",
          role: "",
          fullTime: "",
        });
      } else {
        toast.error(`Error: ${response.message}`);
      }
    } catch (error) {
      toast.error("Error creating account:", error);
      toast.error("Failed to create account.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Account</CardTitle>
          <CardDescription>Fill in your details to create a new account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter Account Email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.fullName} placeholder="Enter Account Name" onChange={(e) => handleChange("fullName", e.target.value)} className={errors.fullName ? "border-red-500" : ""} />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Enter Phone Number" value={formData.phoneNumber} onChange={(e) => handleChange("phoneNumber", e.target.value)} className={errors.phoneNumber ? "border-red-500" : ""} />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender} // Không cần ép kiểu String nữa
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              {/* <Input id="dob" type="date" value={formData.dob} onChange={(e) => handleChange("dob", e.target.value)} className={errors.dob ? "border-red-500" : ""} /> */}
              <CalendarSelector className={errors.dob ? "w-full border-red-500" : "w-full"} setSelectedDate={(date) => handleChange("dob", date ? format(date, "yyyy-MM-dd") : "")} />
              {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={String(formData.role)} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>

            {formData.role === "lecturer" && (
              <div className="space-y-2">
                <Label htmlFor="fullTime">Work Time</Label>
                <Select
                  value={formData.fulltime ? "true" : "false"} // Chuyển boolean thành string đúng
                  onValueChange={(value) => handleChange("fulltime", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Full Time</SelectItem>
                    <SelectItem value="false">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Account Creation</DialogTitle>
            <DialogDescription>Please review your information before creating your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="grid grid-cols-2 gap-2">
              <p className="font-medium">Email:</p>
              <p>{formData.email}</p>

              <p className="font-medium">Name:</p>
              <p>{formData.fullName}</p>

              <p className="font-medium">Phone:</p>
              <p>{formData.phoneNumber}</p>

              <p className="font-medium ">Gender:</p>
              <p className="capitalize">{formData.gender}</p>

              <p className="font-medium">Date of Birth:</p>
              <p>{formData.dob ? format(new Date(formData.dob), "dd/MM/yyyy") : "-"}</p>

              <p className="font-medium">Role:</p>
              <p>{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>

              <p className="font-medium">Employment Type:</p>
              <p>{formData.fulltime === true ? "Full Time" : "Part Time"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
