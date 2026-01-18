using Microsoft.AspNetCore.Mvc;
using CodeReviewer.Api.Models;
using CodeReviewer.Api.Services;

namespace CodeReviewer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(
        IAuthService authService, 
        ILogger<AuthController> logger,
        IConfiguration configuration)
    {
        _authService = authService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(request.Email, request.Password);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed for {Email}", request.Email);
            return StatusCode(500, new { message = "Registration failed" });
        }
    }

    /// <summary>
    /// Login user
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(request.Email, request.Password);

            if (!result.Success)
            {
                return Unauthorized(new { message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for {Email}", request.Email);
            return StatusCode(500, new { message = "Login failed" });
        }
    }
    
    /// <summary>
    /// Refresh JWT token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);

            if (!result.Success)
            {
                return Unauthorized(new { message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed");
            return StatusCode(500, new { message = "Token refresh failed" });
        }
    }

    /// <summary>
    /// Get current user info
    /// </summary>
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _authService.GetUserByIdAsync(Guid.Parse(userId));

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get current user");
            return StatusCode(500, new { message = "Failed to get user info" });
        }
    }

    /// <summary>
    /// GitHub OAuth callback
    /// </summary>
    [HttpPost("github/callback")]
    public async Task<ActionResult<AuthResponse>> GitHubCallback([FromBody] GitHubCallbackRequest request)
    {
        try
        {
            // Exchange code for access token
            var tokenResponse = await ExchangeGitHubCode(request.Code);
            
            if (tokenResponse == null)
            {
                return BadRequest(new { message = "Failed to get GitHub access token" });
            }

            // Get user info from GitHub
            var userInfo = await GetGitHubUserInfo(tokenResponse.AccessToken);
            
            if (userInfo == null)
            {
                return BadRequest(new { message = "Failed to get GitHub user info" });
            }

            // Register or login user
            var result = await _authService.RegisterOrLoginWithGitHub(
                userInfo.Email ?? $"{userInfo.Login}@github.com",
                userInfo.Name ?? userInfo.Login,
                userInfo.AvatarUrl
            );

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GitHub OAuth failed");
            return StatusCode(500, new { message = "GitHub authentication failed" });
        }
    }

    private async Task<GitHubTokenResponse?> ExchangeGitHubCode(string code)
    {
        var clientId = _configuration["GitHub:ClientId"];
        var clientSecret = _configuration["GitHub:ClientSecret"];

        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        
        var response = await httpClient.PostAsync(
            "https://github.com/login/oauth/access_token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "client_id", clientId! },
                { "client_secret", clientSecret! },
                { "code", code }
            })
        );

        if (!response.IsSuccessStatusCode)
            return null;

        var tokenResponse = await response.Content.ReadFromJsonAsync<GitHubTokenResponse>();
        return tokenResponse;
    }

    private async Task<GitHubUserInfo?> GetGitHubUserInfo(string accessToken)
    {
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        httpClient.DefaultRequestHeaders.Add("User-Agent", "CodeReviewer");

        var response = await httpClient.GetAsync("https://api.github.com/user");
        
        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<GitHubUserInfo>();
    }
}

// Request/Response models - ONLY DEFINED ONCE
public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
public record RefreshTokenRequest(string RefreshToken);
public record GitHubCallbackRequest(string Code);

public class GitHubTokenResponse
{
    [System.Text.Json.Serialization.JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;
}

public class GitHubUserInfo
{
    [System.Text.Json.Serialization.JsonPropertyName("login")]
    public string Login { get; set; } = string.Empty;
    
    [System.Text.Json.Serialization.JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("name")]
    public string? Name { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("avatar_url")]
    public string AvatarUrl { get; set; } = string.Empty;
}