using OTMS.API.SignalRHub;
using System.Diagnostics;

namespace OTMS.API.Middleware
{
    public class MonitoringMiddleware
    {
        private readonly RequestDelegate _next;

        public MonitoringMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            bool isSuccess = true;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                isSuccess = false;
                MonitoringHub.LogError(
                    ex.GetType().Name,
                    ex.Message,
                    ex.StackTrace);

                // Log 4xx/5xx errors
                if (context.Response.StatusCode >= 400)
                {
                    MonitoringHub.LogError(
                        "HTTP Error",
                        $"HTTP {context.Response.StatusCode}",
                        context.Request.Path);
                }

                throw;
            }
            finally
            {
                stopwatch.Stop();
                var endpoint = context.Request.Path;
                MonitoringHub.LogRequest(
                    endpoint,
                    isSuccess,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds);
            }
        }
    }
}
