import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// Form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.string().min(1, { message: "Please select a role" }),
  fulltime: z.boolean().optional(),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  dob: z.date({ required_error: "Please select a date of birth" }),
  gender: z.boolean(),
});

export default function AddAccountOfficerPage() {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "",
      fulltime: true,
      phoneNumber: "",
      gender: true,
      status: 3,
    },
  });

  const onSubmit = (data) => {
    setFormData(data);
    setConfirmDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData) return;

    const payload = {
      ...formData,
      dob: format(formData.dob, "dd/MM/yyyy"),
      createdAt: new Date().toISOString(),
    };

    try {
      // Simulate API call
      // const response = await fetch('/api/accounts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // })

      // Simulate API response for demonstration
      const mockResponse = Math.random() > 0.7 ? { ok: false, status: 400, json: async () => ({ error: "Email already exists" }) } : { ok: true, status: 201, json: async () => ({ success: true }) };

      if (!mockResponse.ok) {
        const errorData = await mockResponse.json();
        toast.error(`Something went wrong: ${errorData}`);
        return;
      }

      toast.success("Account has been created successfully");

      // Reset form and close dialog
      form.reset();
      setConfirmDialogOpen(false);
    } catch (error) {
      toast.error(`Failed to create account. Please try again. ${error}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Account</CardTitle>
          <CardDescription>Enter the details to create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Please Enter Email" {...form.register("email")} />
                  {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...form.register("fullName")} placeholder="Please Enter Name" />
                  {form.formState.errors.fullName && <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(value) => form.setValue("role", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="Please Enter Phone Number" />
                  {form.formState.errors.phoneNumber && <p className="text-sm text-red-500">{form.formState.errors.phoneNumber.message}</p>}
                </div>
              </div>

              {form.watch("role") === "lecturer" && (
                <div className="space-y-2">
                  <Label>Work Time</Label>
                  <Select defaultValue="true" onValueChange={(value) => form.setValue("fulltime", value === "true")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Full Time</SelectItem>
                      <SelectItem value="false">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !form.watch("dob") && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("dob") ? format(form.watch("dob"), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={form.watch("dob")} onSelect={(date) => date && form.setValue("dob", date)} initialFocus captionLayout="dropdown-buttons" fromYear={1950} toYear={2010} />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.dob && <p className="text-sm text-red-500">{form.formState.errors.dob.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select defaultValue="true" onValueChange={(value) => form.setValue("gender", value === "true")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Male</SelectItem>
                      <SelectItem value="false">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Information</DialogTitle>
            <DialogDescription>Please review the information before saving.</DialogDescription>
          </DialogHeader>

          {formData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Email:</div>
                <div>{formData.email}</div>

                <div className="font-medium">Full Name:</div>
                <div>{formData.fullName}</div>

                <div className="font-medium ">Role:</div>
                <div className="capitalize">{formData.role}</div>

                {form.watch("role") === "lecturer" && (
                  <>
                    <div className="font-medium">Work Time:</div>
                    <div>{formData.fulltime ? "Full Time" : "Part Time"}</div>
                  </>
                )}

                <div className="font-medium">Phone Number:</div>
                <div>{formData.phoneNumber}</div>

                <div className="font-medium">Date of Birth:</div>
                <div>{format(formData.dob, "dd/MM/yyyy")}</div>

                <div className="font-medium">Gender:</div>
                <div>{formData.gender ? "Male" : "Female"}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
