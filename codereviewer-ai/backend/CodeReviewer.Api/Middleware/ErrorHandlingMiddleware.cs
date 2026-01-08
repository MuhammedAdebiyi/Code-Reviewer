using System.Net;
using System.Text.Json;

namespace CodeReviewer.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var result = JsonSerializer.Serialize(new
        {
            message = "An error occurred processing your request",
            details = exception.Message
        });

        return context.Response.WriteAsync(result);
    }
}

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly RateLimitingService _rateLimitingService;

    public RateLimitingMiddleware(RequestDelegate next, RateLimitingService rateLimitingService)
    {
        _next = next;
        _rateLimitingService = rateLimitingService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var userId = context.User.FindFirst("userId")?.Value;
        var identifier = userId ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        if (!_rateLimitingService.IsAllowed(identifier))
        {
            context.Response.StatusCode = 429;
            context.Response.ContentType = "application/json";
            
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = "Rate limit exceeded. Please try again later."
            }));
            
            return;
        }

        await _next(context);
    }
}

public class RateLimitingService
{
    private readonly Dictionary<string, (int count, DateTime resetTime)> _requests = new();
    private readonly int _maxRequests = 100;
    private readonly TimeSpan _timeWindow = TimeSpan.FromHours(1);

    public bool IsAllowed(string identifier)
    {
        lock (_requests)
        {
            var now = DateTime.UtcNow;

            if (_requests.TryGetValue(identifier, out var record))
            {
                if (now > record.resetTime)
                {
                    // Reset the window
                    _requests[identifier] = (1, now.Add(_timeWindow));
                    return true;
                }

                if (record.count >= _maxRequests)
                {
                    return false;
                }

                _requests[identifier] = (record.count + 1, record.resetTime);
                return true;
            }

            _requests[identifier] = (1, now.Add(_timeWindow));
            return true;
        }
    }
}