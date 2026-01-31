using System.Net;
using Microsoft.Extensions.Caching.Memory;

namespace CodeReviewer.Api.Middleware;

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
        // Skip rate limiting for health checks
        if (context.Request.Path.StartsWithSegments("/health"))
        {
            await _next(context);
            return;
        }

        var clientId = GetClientIdentifier(context);
        var endpoint = context.Request.Path.ToString();

        if (!_rateLimitingService.IsRequestAllowed(clientId, endpoint))
        {
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(new
            {
                message = "Rate limit exceeded. Please try again later.",
                retryAfter = 60
            });

            return;
        }

        await _next(context);
    }

    private string GetClientIdentifier(HttpContext context)
    {
        // Try to get user ID from claims first (for authenticated requests)
        var userId = context.User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            return $"user_{userId}";
        }

        // Fall back to IP address
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"ip_{ipAddress}";
    }
}

public class RateLimitingService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<RateLimitingService> _logger;

    // Rate limit configurations (requests per minute)
    private readonly Dictionary<string, int> _rateLimits = new()
    {
        { "default", 60 },                          // 60 requests per minute default
        { "/api/auth/register", 5 },                // 5 registration attempts per minute
        { "/api/auth/login", 10 },                  // 10 login attempts per minute
        { "/api/auth/verify-email", 10 },           // 10 verification attempts per minute
        { "/api/auth/resend-verification", 3 },     // 3 resend attempts per minute
        { "/api/auth/request-password-reset", 3 },  // 3 password reset requests per minute
        { "/api/auth/reset-password", 5 },          // 5 password reset attempts per minute
        { "/api/review/submit", 10 }                // 10 review submissions per minute
    };

    public RateLimitingService(IMemoryCache cache, ILogger<RateLimitingService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public bool IsRequestAllowed(string clientId, string endpoint)
    {
        var limit = GetRateLimitForEndpoint(endpoint);
        var cacheKey = $"ratelimit_{clientId}_{endpoint}";

        if (!_cache.TryGetValue(cacheKey, out int requestCount))
        {
            requestCount = 0;
        }

        if (requestCount >= limit)
        {
            _logger.LogWarning("⚠️ Rate limit exceeded for {ClientId} on {Endpoint}", clientId, endpoint);
            return false;
        }

        requestCount++;
        
        _cache.Set(cacheKey, requestCount, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
        });

        return true;
    }

    private int GetRateLimitForEndpoint(string endpoint)
    {
        // Check for exact match first
        if (_rateLimits.ContainsKey(endpoint))
        {
            return _rateLimits[endpoint];
        }

        // Check for partial matches
        foreach (var kvp in _rateLimits)
        {
            if (endpoint.StartsWith(kvp.Key, StringComparison.OrdinalIgnoreCase))
            {
                return kvp.Value;
            }
        }

        return _rateLimits["default"];
    }
}