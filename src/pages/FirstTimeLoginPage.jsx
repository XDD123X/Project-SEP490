import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { authMe, changePasswordFirstTime } from "@/services/authService";
import { toast } from "sonner";

async function firstTimeLogin(password, repassword) {
  // This would be your actual API call in a real application
  return new Promise((resolve) => {
    setTimeout(() => {
      if (password === repassword && password.length >= 8) {
        resolve({ status: 200, message: "Password updated successfully" });
      } else {
        resolve({ status: 400, message: "Passwords don't match or are too short" });
      }
    }, 1000);
  });
}

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

    // Basic validation
    if (password.length < 6 || password.length > 25) {
      setError("Password must be at least 6-25 characters long");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
  );
}
