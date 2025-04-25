import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authMe, updateProfile } from "@/services/authService";
import { useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useStore } from "@/services/StoreContext";
import CalendarSelector from "@/components/CalendarSelector";

export default function ProfileForm() {
  const { state, dispatch } = useStore();
  const { user, role } = state;
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      fullname: "",
      phone: "",
      dob: "",
      meetUrl: "",
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await authMe();

        if (response.status === 200) {
          form.reset({
            email: response.data.email,
            fullname: response.data.fullname,
            phone: response.data.phone || "",
            dob: response.data.dob || "",
            meetUrl: response.data.meetUrl || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile information.");
      }
    }

    fetchProfile();
  }, [form]);

  async function onSubmit(data) {
    try {
      const response = await updateProfile(data.fullname, data.phone, data.dob, "", data.meetUrl);

      if (response.status === 200) {
        toast.success("Profile updated successfully!");

        // Cập nhật lại state user
        dispatch({
          type: "SET_USER",
          payload: {
            user: {
              ...user,
              fullName: data.fullname,
              phone: data.phone,
              meetUrl: data.meetUrl,
            },
            role,
          },
        });
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Update Profile Failed:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>This is your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input className="resize-none" {...field} />
              </FormControl>
              <FormDescription>This is your display name to Everyone.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {role?.toLowerCase() === "lecturer" && (
          <FormField
            control={form.control}
            name="meetUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meet URL</FormLabel>
                <FormControl>
                  <Input className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Of Birth</FormLabel>
              <FormControl>
                <CalendarSelector className="w-full" selectedDate={field.value ? new Date(field.value) : null} setSelectedDate={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
