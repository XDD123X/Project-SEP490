import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import * as z from "zod";
import { forgotPassword, requestOtp, verifyOtp } from "@/services/authService";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

const emailSchema = z.object({ email: z.string().email({ message: "Please enter a valid email address" }) });
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^[0-9]+$/, { message: "OTP must contain only numbers" }),
});
const passwordSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be 6-25 characters" }).max(25),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });
  const otpForm = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirmPassword: "" } });

  const handleEmailInputChange = (e) => {
    setEmailError(null);
    emailForm.setValue("email", e.target.value);
  };

  const onEmailSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await requestOtp(data.email);

      if (response.status === 200) {
        setEmail(data.email);
        setStep(2);
        toast.success("OTP sent successfully");
      } else if (response.status === 400) {
        setEmailError("Email Not Found");
        setIsLoading(false);
        return;
      } else {
        setEmailError("Failed to send OTP");
        setIsLoading(false);
      }
    } catch (error) {
      setEmailError("Failed to send OTP");
      console.log(error);
    }
    setIsLoading(false);
  };

  const onOtpSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await verifyOtp(email, data.otp);

      if (response.status === 200) {
        setStep(3);
        toast.success(response.data.message || "OTP verified successfully");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Invalid OTP");
    }
    setIsLoading(false);
  };

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);

    const updateRequest = {
      email,
      otp: otpForm.getValues("otp"),
      newPassword: data.password,
    };

    try {
      const response = await forgotPassword(updateRequest);

      if (response.status === 200) {
        toast.success(response.data.message || "Password reset successfully");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/login";
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred while resetting password");
    }
    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>{GLOBAL_NAME} - Forgot Password</title>
        <meta name="description" content={`${GLOBAL_NAME} - Online Teaching Center.`} />
      </Helmet>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link to="/" className="mr-6 flex items-center">
            <span className="font-bold text-lg">{GLOBAL_NAME} </span>
            <span className="ml-0 font-bold text-lg">.</span>
          </Link>
        </div>
      </header>

      <div className="flex justify-center items-center min-h-screen ">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {step === 1 && "Enter your email to receive a verification code"}
              {step === 2 && "Enter the 6-digit code sent to your email"}
              {step === 3 && "Create a new password for your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={emailError === null ? "" : "text-red-500"}>Email</FormLabel>
                        <FormControl>
                          <Input className={emailError === null ? "" : "border-red-500"} placeholder="Enter your email" {...field} onChange={handleEmailInputChange} />
                        </FormControl>
                        <FormMessage>{emailError === null ? "" : emailError}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                    Continue
                  </Button>
                </form>
              </Form>
            )}
            {step === 2 && (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {/* <Input placeholder="Enter 6-digit code" maxLength={6}  /> */}
                          <div className="flex justify-center items-center my-5">
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                    Verify Code
                  </Button>
                </form>
              </Form>
            )}
            {step === 3 && (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
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
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="link" type="button" className="w-full" onClick={() => setStep(2)} disabled={isLoading}>
                    Back to verification
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
