using System.Text.Json;

namespace OTMS.API.Middleware
{
    public class CustomResponseMiddleware
    {
        private readonly RequestDelegate _next;

        public CustomResponseMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            await _next(context);

            if (!context.Response.HasStarted)
            {
                //401
                if (context.Response.StatusCode == StatusCodes.Status401Unauthorized)
                {
                    context.Response.ContentType = "application/json";
                    var result = "Invalid/Expired token or unauthorized access.";
                    await context.Response.WriteAsync(JsonSerializer.Serialize(result));
                }

                //403
                if (context.Response.StatusCode == StatusCodes.Status403Forbidden)
                {
                    context.Response.ContentType = "application/json";
                    var result = "You do not have permission to access this resource.";
                    await context.Response.WriteAsync(JsonSerializer.Serialize(result));
                }
            }
        }

    }
}
