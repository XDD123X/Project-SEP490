import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Check, ChevronLeft, Clock, Link, Mail, Pencil, Phone, Plus, User, X } from "lucide-react";
import { format } from "date-fns";
import { getAccountById } from "@/services/accountService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { use } from "react";
import { useStore } from "@/services/StoreContext";
import { AccountBadge } from "@/components/BadgeComponent";

export default function ViewAccountDetail() {
  const { id } = useParams();
  const { state } = useStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = state;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getAccountById(id);

        if (response.status === 200 && response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto  px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold uppercase">{profile.role.name} Information</h1>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between mt-4">
          {role.toLowerCase() === "officer" && (
            <>
              <Button onClick={() => navigate(`/officer/account/${profile.role.name}s`)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => navigate(`/officer/account/edit/${profile.accountId}`)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </>
          )}

          {role.toLowerCase() === "lecturer" && (
            <Button onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-muted">
                <AvatarImage src={profile.imgUrl} alt={profile.fullName} />
                <AvatarFallback>{profile.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <CardTitle className="text-2xl mb-2">{profile.fullName}</CardTitle>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {profile.role.name}
                  </Badge>
                  {/* {getStatusBadge(profile.status)} */}
                  <AccountBadge status={profile.status} />
                  {profile.role.name.toLowerCase() === "lecturer" && profile.fulltime && <Badge className="bg-primary">Full-time</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{profile.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm">{profile.phoneNumber}</span>
                  </div>

                  {profile.role.name.toLowerCase() === "lecturer" && (
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Meeting URL:</span>
                      <a href={profile.meetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {profile.meetUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span className="text-sm">{format(new Date(profile.dob), "dd/MM/yyyy")}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Gender:</span>
                    <span className="text-sm">{profile.gender ? "Male" : "Female"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Joined:</span>
                    <span className="text-sm">{format(new Date(profile.createdAt), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>
            {profile.role.name.toLowerCase() === "student" && (
              <div className="mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Parent Information</h3>
                </div>
                <Separator className="my-2" />

                {role.toLowerCase() !== "student" && profile.parents && profile.parents.length > 0 ? (
                  <div className="space-y-6">
                    {profile.parents.map((parent, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">
                            {parent.gender ? "Mr." : "Ms."} {parent.fullName}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Phone:</span>
                            <span className="text-sm">{parent.phoneNumber}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm">{parent.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">No parent details available</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
