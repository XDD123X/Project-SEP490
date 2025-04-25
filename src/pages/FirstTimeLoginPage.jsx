import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { authMe, changePasswordFirstTime } from "@/services/authService";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function FirstTimeLoginPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = state;

  useEffect(() => {
    if (user && !user.isNew) {
      navigate(`/${user.role}`);
    }
    toast.warning("Please change your password on your first login.");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Regex kiểm tra password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,30}$/;

    if (!passwordRegex.test(password)) {
      setError("Password must be 6-30 characters long, contain at least 1 uppercase letter and 1 number.");
      return;
    }

    if (password !== repassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await changePasswordFirstTime("", password, repassword);

      if (response.status === 200) {
        localStorage.setItem("isFirstTime", "true");
        toast.success("Password updated successfully. Redirecting...");

        const userResponse = await authMe();
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
          isNew: userResponse.data.isNew,
        };

        const role = userResponse.data.role;
        dispatch({ type: "SET_USER", payload: { user, role } });

        setTimeout(() => {
          navigate(`/${user.role}`);
        }, 1000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user && !user.isNew) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{GLOBAL_NAME} - Set New Password</title>
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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>Welcome! Since this is your first time logging in, please create a new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your new password" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repassword">Confirm Password</Label>
                <Input id="repassword" type="password" value={repassword} onChange={(e) => setRepassword(e.target.value)} placeholder="Confirm your new password" required />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating..." : "Set New Password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
