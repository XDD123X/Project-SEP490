import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSettingById, updateSetting } from "@/services/classSettingService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function AdminClassSettingsPage() {
  const { settingId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [setting, setSetting] = useState(null);
  const [formData, setFormData] = useState({
    id: 0,
    slotNumber: 0,
    sessionPerWeek: 0,
    sessionTotal: 0,
  });

  useEffect(() => {
    if (!settingId) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getSettingById(settingId);
        if (response.status === 200) {
          setSetting(response.data);
          setFormData({
            id: response.data.settingId,
            slotNumber: response.data.slotNumber,
            sessionPerWeek: response.data.sessionPerWeek,
            sessionTotal: response.data.sessionTotal,
          });
        }
        setIsLoading(false);
      } catch (error) {
        toast.error(error);
        console.log(error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [settingId]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Saving settings:", formData);
      const res = await updateSetting(formData.id, formData); // đảm bảo formData có id
      if (res.status === 200) {
        toast.success("Setting updated successfully!");
        setTimeout(() => {
          navigate("/administrator/settings");
        }, 1000);
      } else {
        toast.error(`Failed to update: ${res.message}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    }
  };

  if (!setting) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-primary/10">
          <Spinner />
        </div>
      )}
      <div className="mb-6 flex items-center gap-4">
        <Link to="/administrator/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit {setting.title} Setting</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Configuration</CardTitle>
          <CardDescription>Update the {setting.title} class setting configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="slot-number">Slots Per Day</Label>
                <Input id="slot-number" type="number" value={formData.slotNumber} onChange={(e) => handleChange("slotNumber", Number.parseInt(e.target.value))} min={1} max={4} required />
                <p className="text-xs text-muted-foreground">Maximum number of class slots per day</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-per-week">Sessions Per Week</Label>
                <Input id="session-per-week" type="number" value={formData.sessionPerWeek} onChange={(e) => handleChange("sessionPerWeek", Number.parseInt(e.target.value))} min={1} max={4} required />
                <p className="text-xs text-muted-foreground">Number of sessions per week for each class</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-total">Total Sessions</Label>
                <Input id="session-total" type="number" value={formData.sessionTotal} onChange={(e) => handleChange("sessionTotal", Number.parseInt(e.target.value))} min={1} max={72} required />
                <p className="text-xs text-muted-foreground">Total number of sessions for the entire course</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link to="/administrator/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
