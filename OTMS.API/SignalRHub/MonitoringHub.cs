using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.SignalR;
using OTMS.BLL.DTOs;
using System.Collections.Concurrent;
using System.Diagnostics;

namespace OTMS.API.SignalRHub
{
    public sealed class MonitoringHub : Hub
    {
        private static Timer _broadcastTimer;
        private static readonly DateTime _serverStartTime = DateTime.Now;
        private static readonly ConcurrentDictionary<string, string> _userGroups = new();
        private static readonly ConcurrentDictionary<string, UserInfo> _activeConnections = new();
        private static IHubContext<MonitoringHub> _hubContext;
        private static readonly Dictionary<string, MonitoringData> _monitoringData = new();
        private static readonly List<ApiRequestInfo> _apiRequests = new();
        private static readonly List<ErrorLog> _errorLogs = new();
        private static int _totalRequestsToday = 0;
        private static int _requestsThisMinute = 0;
        private static int _error4xxCount = 0;
        private static int _error5xxCount = 0;
        private static DateTime _lastMinuteCheck = DateTime.Now;
        private static readonly object _lock = new();

        public MonitoringHub(IHubContext<MonitoringHub> hubContext)
        {
            _hubContext = hubContext;

            // Khởi tạo timer nếu chưa có
            if (_broadcastTimer == null)
            {
                _broadcastTimer = new Timer(BroadcastData, null, 1000, 1000);
            }
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _userGroups[Context.ConnectionId] = groupName;

            // Gửi thông báo có user mới tham gia
            await Clients.Group(groupName).SendAsync("UserJoined", Context.ConnectionId);
        }
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            _userGroups.TryRemove(Context.ConnectionId, out _);

            // Gửi thông báo có user rời đi
            await Clients.Group(groupName).SendAsync("UserLeft", Context.ConnectionId);
        }

        public async Task SendToGroup(string groupName, string methodName, object data)
        {
            await _hubContext.Clients.Group(groupName).SendAsync(methodName, data);
        }

        public async Task SendToMonitoringClients(object data)
        {
            await _hubContext.Clients.Group("MonitoringClients").SendAsync("ReceiveMonitoringData", data);
        }

        private void BroadcastData(object? state)
        {
            var monitoringData = CollectMonitoringData();

            // Chỉ gửi đến clients trong nhóm MonitoringClients
            _ = _hubContext.Clients.Group("MonitoringClients").SendAsync("ReceiveMonitoringData", monitoringData);
        }

        // Method để gửi monitoring data tới client
        public async Task SendMonitoringDataToClient(string clientId)
        {
            var monitoringData = CollectMonitoringData();
            await Clients.Client(clientId).SendAsync("ReceiveMonitoringData", monitoringData);
        }

        // Method để gửi data tới tất cả clients đang monitoring
        public async Task BroadcastMonitoringData()
        {
            var monitoringData = CollectMonitoringData();
            await Clients.All.SendAsync("ReceiveMonitoringData", monitoringData);
        }

        // Method để log request từ middleware/controller
        public static void LogRequest(string endpoint, bool isSuccess, int statusCode, long durationMs)
        {
            lock (_lock)
            {
                _totalRequestsToday++;
                _requestsThisMinute++;

                // Reset counter mỗi phút
                if ((DateTime.Now - _lastMinuteCheck).TotalMinutes >= 1)
                {
                    _requestsThisMinute = 0;
                    _lastMinuteCheck = DateTime.Now;
                }

                // Log errors
                if (statusCode >= 400 && statusCode < 500)
                {
                    _error4xxCount++;
                }
                else if (statusCode >= 500)
                {
                    _error5xxCount++;
                }

                // Track API endpoints
                var existingEndpoint = _apiRequests.FirstOrDefault(x => x.Endpoint == endpoint);
                if (existingEndpoint != null)
                {
                    existingEndpoint.Count++;
                    existingEndpoint.TotalDurationMs += durationMs;
                }
                else
                {
                    _apiRequests.Add(new ApiRequestInfo
                    {
                        Endpoint = endpoint,
                        Count = 1,
                        TotalDurationMs = durationMs
                    });
                }
            }
        }

        // Method để log error từ middleware/controller
        public static void LogError(string errorType, string message, string? stackTrace = null)
        {
            lock (_lock)
            {
                _errorLogs.Add(new ErrorLog
                {
                    Timestamp = DateTime.Now,
                    ErrorType = errorType,
                    Message = message,
                    StackTrace = stackTrace
                });

                // Giữ chỉ 100 error logs gần nhất
                if (_errorLogs.Count > 100)
                {
                    _errorLogs.RemoveAt(0);
                }
            }
        }

        private MonitoringData CollectMonitoringData()
        {
            var process = Process.GetCurrentProcess();
            var cpuUsage = GetCpuUsage(process);
            var memoryUsage = process.WorkingSet64 / (1024 * 1024); // MB

            // Tính toán uptime
            var uptime = DateTime.Now - _serverStartTime;

            var topEndpoints = _apiRequests
                .Where(x =>
                    !x.Endpoint.Contains("monitoringHub") &&
                    !x.Endpoint.Contains("login") &&
                    !x.Endpoint.Contains("token")
                )
                .OrderByDescending(x => x.Count)
                .Take(5)
                .Select(x => new ApiEndpointInfo
                {
                    Endpoint = x.Endpoint,
                    RequestCount = x.Count,
                    AverageResponseTime = x.Count > 0 ? x.TotalDurationMs / x.Count : 0
                })
                .ToList();

            var filteredApiRequests = _apiRequests
                .Where(x => !x.Endpoint.Contains("monitoringHub"))
                .ToList();

            var recentErrors = _errorLogs
                .OrderByDescending(x => x.Timestamp)
                .Take(5)
                .ToList();

            var successRate = _totalRequestsToday > 0
                ? ((double)(_totalRequestsToday - _error4xxCount - _error5xxCount) / _totalRequestsToday) * 100
                : 100;

            return new MonitoringData
            {
                Timestamp = DateTime.Now,
                RequestCount = new RequestCountInfo
                {
                    TotalRequestsToday = _totalRequestsToday,
                    RequestsPerMinute = _requestsThisMinute
                },
                ErrorCount = new ErrorCountInfo
                {
                    Error4xxCount = _error4xxCount,
                    Error5xxCount = _error5xxCount
                },
                SuccessRate = Math.Round(successRate, 2),
                TopApiEndpoints = topEndpoints,
                PerformanceMetrics = new PerformanceMetrics
                {
                    AverageResponseTime = filteredApiRequests.Count > 0
                        ? filteredApiRequests.Sum(x => x.TotalDurationMs) / filteredApiRequests.Sum(x => x.Count)
                        : 0,
                    CpuUsage = cpuUsage,
                    MemoryUsage = memoryUsage
                },
                ConnectionInfo = new ConnectionInfo
                {
                    OnlineConnections = _monitoringData.Count
                },
                RecentErrors = recentErrors,
                ServerInfo = new ServerInfo
                {
                    Uptime = uptime,
                    StartTime = _serverStartTime,
                    ProcessName = process.ProcessName,
                    ProcessId = process.Id
                }
            };
        }

        private double GetCpuUsage(Process process)
        {
            var startTime = DateTime.Now;
            var startCpuUsage = process.TotalProcessorTime;

            Thread.Sleep(500); // Đo CPU trong 500ms

            var endTime = DateTime.Now;
            var endCpuUsage = process.TotalProcessorTime;

            var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
            var totalMsPassed = (endTime - startTime).TotalMilliseconds;
            var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);

            return Math.Round(cpuUsageTotal * 100, 2);
        }

        public override async Task OnConnectedAsync()
        {
            // Thêm connection mới vào danh sách
            var userInfo = new UserInfo
            {
                ConnectionId = Context.ConnectionId,
                ConnectedTime = DateTime.UtcNow,
                UserName = Context.User?.Identity?.Name ?? "Anonymous"
            };

            _activeConnections.TryAdd(Context.ConnectionId, userInfo);

            // Thông báo có user mới kết nối
            await Clients.All.SendAsync("UserConnected", userInfo);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_userGroups.TryGetValue(Context.ConnectionId, out var groupName))
            {
                await Clients.Group(groupName).SendAsync("UserLeft", Context.ConnectionId);
                _userGroups.TryRemove(Context.ConnectionId, out _);
            }

            if (_activeConnections.TryRemove(Context.ConnectionId, out var userInfo))
            {
                // Thông báo user đã ngắt kết nối
                await Clients.All.SendAsync("UserDisconnected", userInfo);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Method để client request data
        public async Task RequestMonitoringData()
        {
            var monitoringData = CollectMonitoringData();
            await Clients.Caller.SendAsync("ReceiveMonitoringData", monitoringData);
        }

        public Task<List<UserInfo>> GetAllActiveUsers()
        {
            return Task.FromResult(_activeConnections.Values.ToList());
        }

    }

    // Các model hỗ trợ
    public class MonitoringData
    {
        public DateTime Timestamp { get; set; }
        public RequestCountInfo RequestCount { get; set; } = new();
        public ErrorCountInfo ErrorCount { get; set; } = new();
        public double SuccessRate { get; set; }
        public List<ApiEndpointInfo> TopApiEndpoints { get; set; } = new();
        public PerformanceMetrics PerformanceMetrics { get; set; } = new();
        public ConnectionInfo ConnectionInfo { get; set; } = new();
        public List<ErrorLog> RecentErrors { get; set; } = new();
        public ServerInfo ServerInfo { get; set; } = new();
    }

    public class UserInfo
    {
        public string ConnectionId { get; set; }
        public string UserName { get; set; }
        public DateTime ConnectedTime { get; set; }
        public TimeSpan Uptime => DateTime.UtcNow - ConnectedTime;
    }
    public class RequestCountInfo
    {
        public int TotalRequestsToday { get; set; }
        public int RequestsPerMinute { get; set; }
    }

    public class ErrorCountInfo
    {
        public int Error4xxCount { get; set; }
        public int Error5xxCount { get; set; }
    }

    public class ApiEndpointInfo
    {
        public string Endpoint { get; set; } = string.Empty;
        public int RequestCount { get; set; }
        public long AverageResponseTime { get; set; } // ms
    }

    public class PerformanceMetrics
    {
        public long AverageResponseTime { get; set; } // ms
        public double CpuUsage { get; set; } // %
        public double MemoryUsage { get; set; } // MB
    }

    public class ConnectionInfo
    {
        public int OnlineConnections { get; set; }
    }

    public class ErrorLog
    {
        public DateTime Timestamp { get; set; }
        public string ErrorType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? StackTrace { get; set; }
    }

    public class ApiRequestInfo
    {
        public string Endpoint { get; set; } = string.Empty;
        public int Count { get; set; }
        public long TotalDurationMs { get; set; }
    }

    public class ServerInfo
    {
        public TimeSpan Uptime { get; set; }
        public DateTime StartTime { get; set; }
        public string ProcessName { get; set; } = string.Empty;
        public int ProcessId { get; set; }
    }
}
