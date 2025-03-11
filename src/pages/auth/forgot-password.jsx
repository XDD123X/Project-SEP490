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

const emailSchema = z.object({ email: z.string().email({ message: "Please enter a valid email address" }) });
const otpSchema = z.object({
    otp: z.string().length(6, { message: "OTP must be 6 digits" }).regex(/^[0-9]+$/, { message: "OTP must contain only numbers" }),
});
const passwordSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const emailForm = useForm({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });
    const otpForm = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
    const passwordForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirmPassword: "" } });

    const onEmailSubmit = async (data) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setEmail(data.email);
        setStep(2);
        toast.success("OTP sent successfully");
        setIsLoading(false);
    };

    const onOtpSubmit = async (data) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setStep(3);
        setIsLoading(false);
    };

    const onPasswordSubmit = async (data) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Password reset successfully");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/login";
        setIsLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
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
                                <FormField control={emailForm.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
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
                                <FormField control={otpForm.control} name="otp" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter 6-digit code" maxLength={6} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
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
                        Remember your password? <a href="/login" className="text-primary hover:underline">Sign in</a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}