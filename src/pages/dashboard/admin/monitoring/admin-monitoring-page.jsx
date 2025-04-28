import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Clock, Cpu, Database, HardDrive, BarChart3, Users, FileWarning, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import ErrorLogsTable from "./components/error-log-table";

import * as signalR from "@microsoft/signalr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSignalR } from "@/hooks/signalRProvider";
import signalRService from "@/hooks/signalRService";

export default function AdminMonitoring() {
  const { signalRService, isConnected } = useSignalR();
  const [data, setData] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!isConnected) return;
  
    const groupName = "MonitoringClients";
  
    const joinGroupAndSubscribe = async () => {
      try {
        // Tham gia group monitoring
        await signalRService.joinGroup(groupName);
  
        // Đăng ký lắng nghe dữ liệu từ group
        signalRService.onGroupMessage(
          groupName, 
          "ReceiveMonitoringData", 
          setData
        );
  
        // Lấy danh sách tất cả user đang kết nối (không chỉ trong group)
        const allUsers = await signalRService.fetchActiveUsers();
        setActiveUsers(allUsers);
  
        // Đăng ký lắng nghe sự kiện user kết nối/ngắt kết nối toàn hệ thống
        signalRService.on("UserConnected", (userInfo) => {
          setActiveUsers(prev => [...prev, userInfo]);
        });
  
        signalRService.on("UserDisconnected", (userInfo) => {
          setActiveUsers(prev => prev.filter(user => user.connectionId !== userInfo.connectionId));
        });
  
      } catch (err) {
        console.error("Failed to initialize SignalR:", err);
      }
    };
  
    joinGroupAndSubscribe();
  
    return () => {
      // Cleanup khi component unmount
      const cleanup = async () => {
        try {
          await signalRService.leaveGroup(groupName);
          
          signalRService.offGroupMessage(groupName, "ReceiveMonitoringData");
          signalRService.off("UserConnected");
          signalRService.off("UserDisconnected");
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      
      cleanup();
    };
  }, [isConnected, signalRService]);

  if (!data) {
    return <div>Loading monitoring data...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <h1 className="text-xl font-semibold">Admin Monitoring Dashboard</h1>
          <Badge variant="outline" className="ml-2">
            Live
          </Badge>

          <div className="ml-auto flex items-center gap-4">
            <Badge variant={data.successRate > 95 ? "success" : "destructive"} className="ml-auto">
              {data.successRate.toFixed(2)}% Success Rate
            </Badge>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {/* Server Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Server Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-green-500">Process</span>
                  <span className="font-medium">{data.serverInfo.processName}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-green-500">Process ID</span>
                  <span className="font-medium">{data.serverInfo.processId}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-green-500">Uptime</span>
                  <span className="font-medium">{data.serverInfo.uptime.split(".")[0]}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm  text-green-500">Online Users</span>
                  <span className="flex items-center gap-4 font-medium">
                    <User className="w-4 h-4" />
                    {/* {data.connectionInfo.onlineConnections} */}
                    {activeUsers.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Request Count</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.requestCount.totalRequestsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{data.requestCount.requestsPerMinute} requests per minute</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Count</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {" "}
                  {data.errorCount.error4xxCount} / {data.errorCount.error5xxCount}
                </div>
                <p className="text-xs text-muted-foreground">4xx / 5xx errors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.successRate.toFixed(2)}%</div>
                <Progress value={data.successRate} className="mt-2" primaryColor={data.successRate > 95 ? "bg-green-500" : "bg-yellow-500"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.performanceMetrics.averageResponseTime} ms</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
                <CardDescription>Most frequently accessed API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Avg. Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topApiEndpoints
                      // .filter((e) => !(e.endpoint.includes("/monitoringHub") || e.endpoint.includes("/Notifications")))
                      .map((endpoint) => (
                        <TableRow key={endpoint.endpoint}>
                          <TableCell className="font-medium">{endpoint.endpoint}</TableCell>
                          <TableCell className="text-right">{endpoint.requestCount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{endpoint.averageResponseTime} ms</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current server resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">CPU Usage</span>
                      </div>
                      <span className="text-sm">{data.performanceMetrics.cpuUsage}%</span>
                    </div>
                    <Progress value={data.performanceMetrics.cpuUsage} className="h-2" primaryColor={data.performanceMetrics.cpuUsage > 80 ? "bg-red-500" : data.performanceMetrics.cpuUsage > 60 ? "bg-yellow-500" : "bg-green-500"} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Memory Usage</span>
                      </div>
                      <span className="text-sm">{data.performanceMetrics.memoryUsage} MB</span>
                    </div>
                    <Progress
                      value={(data.performanceMetrics.memoryUsage / 1024) * 100}
                      primaryColor={(data.performanceMetrics.memoryUsage / 1024) * 100 > 80 ? "bg-red-500" : (data.performanceMetrics.memoryUsage / 1024) * 100 > 60 ? "bg-yellow-500" : "bg-green-500"}
                    />
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Database Connections</span>
                      <Badge variant="outline" className="ml-auto">
                        Healthy
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Online Connections</span>
                      <span className="ml-auto text-sm font-medium">{data.connectionInfo.onlineConnections}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Live Error Logs</CardTitle>
              <CardDescription>Real-time error monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentErrors && data.recentErrors.length > 0 ? (
                <ErrorLogsTable data={data.recentErrors.slice(0, 5)} />
              ) : (
                <Alert>
                  <FileWarning className="h-4 w-4" />
                  <AlertTitle>No errors</AlertTitle>
                  <AlertDescription>No errors have been recorded in the current session.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
