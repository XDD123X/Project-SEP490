import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "../ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { useStore } from "@/services/StoreContext";
import { authMe, login } from "@/services/authService";
import { Eye, EyeOff } from "lucide-react";
import { setAccessToken } from "@/services/axiosClient";
export function LoginForm() {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // validateForm();
  };

  const handleChangeCheck = (checked) => {
    console.log(checked);

    setFormData((prevData) => ({
      ...prevData,
      rememberMe: checked,
    }));
    console.log(formData);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!/^.{6,25}$/.test(formData.password)) {
      //(?=.*[A-Z]) uppercase
      //(?=.*\d) number
      //(?=.*[\W_]) special char
      //{6,25}$ length
      newErrors.password = "Password must be 6-25 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { email, password } = formData;
      if (!email || !password) {
        toast.error("Invalid email or password!");
        setIsLoading(false);
        return;
      }

      // Call login API
      const response = await login(email, password, formData.rememberMe);

      if (response.status === 200 && response?.data) {
        const userResponse = await authMe();

        const user = {
          uid: userResponse.data.accountId,
          email: userResponse.data.email,
          name: userResponse.data.fullname,
          phone: userResponse.data.phone,
          dob: userResponse.data.dob,
          imgUrl: userResponse.data.imgUrl,
          role: userResponse.data.role,
          schedule: userResponse.data.schedule,
        };

        const role = userResponse.data.role;
        dispatch({ type: "SET_USER", payload: { user, role } });
        toast.success("Login successful!");
        navigate(`/${role.toLowerCase()}`);
      } else if (response.status === 401) {
        toast.error("Incorrect email or password. Please try again!");
      } else if (response.status === 403) {
        toast.warning("Account has been suspended! Contact our staff for assistance.");
      } else if (response.status === 500) {
        toast.error("Server error. Please try again later!");
      } else {
        toast.error("Unable to connect to the server. Please check your network!");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isLoading && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center z-[99999]">
          <Spinner />
        </div>
      )}
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">Login to your Acme Inc account</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input tabIndex={1} id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} className={errors.email ? "border-red-500" : ""} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link tabIndex={5} to="/forgot-password" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    tabIndex={2}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox tabIndex={4} id="rememberMe" name="rememberMe" checked={formData.rememberMe} onCheckedChange={handleChangeCheck} />
                  <label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Remember Me
                  </label>
                </div>
              </div>

              <Button tabIndex={3} type="submit" className="w-full">
                Login
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
              <div className="grid gap-4">
                <Button variant="outline" className="w-full" onClick={() => toast.error("Oops! Function Under Development")}>
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img src="https://wallpapers.com/images/featured/teacher-hnlnd76tuq5wxeaz.jpg" alt="Image" className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]" />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
