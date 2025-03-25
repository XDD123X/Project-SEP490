import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "../ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { useStore } from "@/services/StoreContext";
import { authMe, login, loginWithGoogleEmail } from "@/services/authService";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
export function LoginForm() {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
        console.log(userResponse.data);
        
        const user = {
          uid: userResponse.data.accountId,
          email: userResponse.data.email,
          name: userResponse.data.fullname,
          phone: userResponse.data.phone,
          dob: userResponse.data.dob,
          imgUrl: userResponse.data.imgUrl,
          meetUrl: userResponse.data.meetUrl,
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

  const handleLoginByGoogle = async (credentialResponse) => {
    if (credentialResponse?.preventDefault) {
      credentialResponse.preventDefault();
    }

    if (!credentialResponse || !credentialResponse.credential) {
      toast.error("Google Login Failed");
      return;
    }

    // Giải mã JWT từ Google để lấy email
    const decoded = jwtDecode(credentialResponse.credential);
    const email = decoded.email;

    if (!email) {
      toast.error("Không lấy được email từ Google");
      return;
    }

    try {
      // Gửi email lên API backend để xử lý login
      const loginResponse = await loginWithGoogleEmail(email);
      if (loginResponse.status === 200) {
        // Sau khi login thành công, gọi AuthMe để lấy thông tin user
        const userData = await authMe();

        const user = {
          uid: userData.data.accountId,
          email: userData.data.email,
          name: userData.data.fullname,
          phone: userData.data.phone,
          dob: userData.data.dob,
          imgUrl: userData.data.imgUrl,
          meetUrl: userData.data.meetUrl,
          role: userData.data.role,
          schedule: userData.data.schedule,
        };

        const role = userData.data.role;
        dispatch({ type: "SET_USER", payload: { user, role } });

        // Chờ toast hiển thị xong rồi mới chuyển hướng
        toast.success("Login successful!", {
          onClose: () => navigate(`/${role.toLowerCase()}`),
        });
      } else {
        // Xử lý các lỗi khác
        handleLoginError(loginResponse.status);
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập bằng Google:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  const handleLoginError = (status) => {
    switch (status) {
      case 400:
        toast.error("Invalid login request. Please try again.");
        break;
      case 401:
        toast.error("Unauthorized! Incorrect email or password.");
        break;
      case 403:
        toast.error("Your account has been suspended.");
        break;
      case 408:
        toast.error("Login request timed out. Please try again.");
        break;
      default:
        toast.error("An unexpected error occurred. Please try again later.");
        break;
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
              <div className="flex justify-center items-center">
                <div className="flex justify-center items-center">
                  <GoogleLogin onSuccess={(credentialResponse) => handleLoginByGoogle(credentialResponse)} onError={() => console.error("Google Login Failed")} />
                </div>
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
