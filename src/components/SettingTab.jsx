import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SettingsTab({ vndRate, setVndRate }) {
  const [rateInput, setRateInput] = useState(vndRate.toString());

  const handleSave = () => {
    const newRate = Number.parseFloat(rateInput);
    if (isNaN(newRate) || newRate <= 0) {
      toast('Please enter a valid positive number.');
      return;
    }

    setVndRate(newRate);
    toast('The Vietnamese Dong rate has been updated successfully.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vnd-rate">Current Vietnamese Dong Rate (USD)</Label>
            <div className="flex items-center gap-2">
              <Input id="vnd-rate" type="number" step="1" value={rateInput} onChange={(e) => setRateInput(e.target.value)} placeholder="Enter VND rate" />
              <Button onClick={handleSave}>Save</Button>
            </div>
            <p className="text-sm text-muted-foreground">Enter the current exchange rate for 1 USD in Vietnamese Dong</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
