import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/services/authService";
import { toast } from "sonner";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,30}$/;

const passwordFormSchema = z
  .object({
    oldPassword: z.string().min(6, { message: "Old password must be at least 6 characters." }),

    newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }).max(30, { message: "New password must be at most 30 characters." }).regex(passwordRegex, {
      message: "Password must contain at least 1 uppercase letter and 1 number.",
    }),

    confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ProfilePassword() {
  const form = useForm({
    resolver: zodResolver(passwordFormSchema),
    mode: "onChange",
  });

  async function onSubmit(data) {
    try {
      const response = await changePassword(data.oldPassword, data.newPassword, data.confirmPassword);

      if (response.status === 200) {
        toast.success("Password updated successfully.");

        // Reset form sau khi đổi mật khẩu thành công
        form.reset({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error("Old password does not match");
        form.setError("oldPassword", {
          type: "manual",
          message: "Old password does not match",
        });
      }
    } catch (error) {
      console.error("Change Password Failed:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter old password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Change Password</Button>
      </form>
    </Form>
  );
}
