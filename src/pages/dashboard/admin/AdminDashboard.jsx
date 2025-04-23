import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Badge, BookOpen, Calendar, ChevronRight, Clock, Edit, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { getAccountStatistics } from "@/services/adminDashboardService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getAllSetting, getCurrentSetting } from "@/services/classSettingService";
import { CardFooter } from "react-bootstrap";

export default function AdminDashboard() {
  // State for class settings
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [accountStats, setAccountStats] = useState();
  const [classSetting, setClassSetting] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        //statistics
        const response = await getAccountStatistics();
        const setting = await getAllSetting();
        if (response.status === 200) {
          setAccountStats(response.data);
          setClassSetting(setting.data);
          console.log(setting.data);
        }
      } catch (error) {
        toast.error(error);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  // First, replace the reportData with this more comprehensive data structure
  const allClasses = [
    { id: 1, code: "ENG101", name: "Basic English", shouldReport: true },
    { id: 2, code: "ENG102", name: "Intermediate English", shouldReport: true },
    { id: 3, code: "ENG203", name: "Advanced Grammar", shouldReport: true },
    { id: 4, code: "ENG204", name: "Business English", shouldReport: true },
    { id: 5, code: "ENG305", name: "Academic Writing", shouldReport: true },
    { id: 6, code: "ENG306", name: "Public Speaking", shouldReport: true },
    { id: 7, code: "ENG107", name: "Conversation Practice", shouldReport: true },
  ];

  // Generate dates for the last 7 days
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const last7Days = getLast7Days();

  // Reports data with submitted status
  const reportData = [
    {
      date: last7Days[0],
      submittedClasses: ["ENG101", "ENG203"],
      pendingClasses: ["ENG102", "ENG204", "ENG305", "ENG306", "ENG107"],
    },
    {
      date: last7Days[1],
      submittedClasses: ["ENG102", "ENG204", "ENG306"],
      pendingClasses: ["ENG101", "ENG203", "ENG305", "ENG107"],
    },
    {
      date: last7Days[2],
      submittedClasses: ["ENG101", "ENG203", "ENG305", "ENG102", "ENG204", "ENG306", "ENG107"],
      pendingClasses: [],
    },
    {
      date: last7Days[3],
      submittedClasses: ["ENG101", "ENG203"],
      pendingClasses: ["ENG102", "ENG204", "ENG305", "ENG306", "ENG107"],
    },
    {
      date: last7Days[4],
      submittedClasses: ["ENG102", "ENG204", "ENG306", "ENG107"],
      pendingClasses: ["ENG101", "ENG203", "ENG305"],
    },
    {
      date: last7Days[5],
      submittedClasses: ["ENG101", "ENG203", "ENG305", "ENG102", "ENG204", "ENG306"],
      pendingClasses: ["ENG107"],
    },
    {
      date: last7Days[6],
      submittedClasses: ["ENG107", "ENG101", "ENG102"],
      pendingClasses: ["ENG203", "ENG204", "ENG305", "ENG306"],
    },
  ];

  const handleSettingChange = (field) => (e) => {
    setFormValues({ ...formValues, [field]: parseInt(e.target.value) || 0 });
  };

  const handleSaveSettings = () => {
    setIsEditing(false);
    // Here you would typically save the settings to your backend
  };

  if (!accountStats || !classSetting) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Account Statistics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {/* student card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountStats.student.count}</div>
                  <div className="flex items-center text-xs">
                    {accountStats.student.change > 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">+{accountStats.student.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500">-{accountStats.student.change}%</span>
                      </>
                    )}
                    <span className="ml-1 text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* lecturer card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Lecturers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountStats.lecturer.count}</div>
                  <div className="flex items-center text-xs">
                    {accountStats.lecturer.change > 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">+{accountStats.lecturer.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500">-{accountStats.lecturer.change}%</span>
                      </>
                    )}
                    <span className="ml-1 text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* officer card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Officers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountStats.officer.count}</div>
                  <div className="flex items-center text-xs">
                    {accountStats.officer.change > 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">+{accountStats.officer.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500">-{accountStats.officer.change}%</span>
                      </>
                    )}
                    <span className="ml-1 text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* class card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Classes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountStats.class.count}</div>
                  <div className="flex items-center text-xs">
                    {accountStats.class.change > 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">+{accountStats.class.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500">-{accountStats.class.change}%</span>
                      </>
                    )}
                    <span className="ml-1 text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* course card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Courses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountStats.course.count}</div>
                  <div className="flex items-center text-xs">
                    {accountStats.course.change > 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">+{accountStats.course.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500">-{accountStats.course.change}%</span>
                      </>
                    )}
                    <span className="ml-1 text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Class Settings</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {classSetting.map((setting) => (
                <Card key={setting.settingId} className="overflow-hidden">
                  <CardHeader className="pb-4 text-xl text-center uppercase">
                    <CardTitle>{setting.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Slots Per Day</p>
                          <p className="font-medium">{setting.slotNumber}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Sessions Per Week</p>
                          <p className="font-medium">{setting.sessionPerWeek}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Sessions</p>
                        <p className="font-medium">{setting.sessionTotal}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Updated {new Date(setting.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="m-4 mt-0">
                    <Link to={`/administrator/settings/${setting.settingId}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Edit className="h-3.5 w-3.5" />
                        Edit Settings
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* <div>
            <h2 className="mb-4 text-xl font-semibold">Reports Per Date</h2>
            <Card>
              <CardHeader>
                <CardTitle>Daily Reports</CardTitle>
                <CardDescription>
                  Report status for the last 7 days ({new Date(last7Days[0]).toLocaleDateString()} - {new Date(last7Days[6]).toLocaleDateString()})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <TooltipProvider>
                    {reportData.map((report, index) => {
                      const totalClasses = allClasses.length;
                      const submittedCount = report.submittedClasses.length;
                      const completionPercentage = (submittedCount / totalClasses) * 100;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{new Date(report.date).toLocaleDateString("vi-VN")}</div>
                            <div className="text-sm text-muted-foreground">
                              {submittedCount} of {totalClasses} reports submitted ({Math.round(completionPercentage)}%)
                            </div>
                          </div>

                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <div className="relative h-8 w-full rounded-full bg-muted">
                                <div className="absolute left-0 top-0 h-8 rounded-full bg-primary" style={{ width: `${completionPercentage}%` }}></div>
                                <div className="absolute left-0 top-0 flex h-8 w-full items-center justify-center text-sm font-medium">
                                  {submittedCount} / {totalClasses}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-2">
                                <div>
                                  <p className="font-medium text-green-500">Submitted Reports:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {report.submittedClasses.length > 0 ? (
                                      report.submittedClasses.map((code, idx) => (
                                        <span key={idx} className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                                          {code}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No reports submitted</span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <p className="font-medium text-amber-500">Pending Reports:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {report.pendingClasses.length > 0 ? (
                                      report.pendingClasses.map((code, idx) => (
                                        <span key={idx} className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                                          {code}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-xs text-green-500">All reports submitted!</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      );
                    })}
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </main>
      </div>
    </div>
  );
}
