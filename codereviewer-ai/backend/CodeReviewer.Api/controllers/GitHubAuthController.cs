using Microsoft.AspNetCore.Mvc;
using CodeReviewer.Api.Services;
using System.Text.Json;

namespace CodeReviewer.Api.Controllers;

[ApiController]
[Route("api/auth/github")]
public class GitHubAuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GitHubAuthController> _logger;
    private readonly HttpClient _httpClient;

    public GitHubAuthController(
        IAuthService authService,
        IConfiguration configuration,
        ILogger<GitHubAuthController> logger,
        IHttpClientFactory httpClientFactory)
    {
        _authService = authService;
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    /// <summary>
    /// GitHub OAuth callback
    /// </summary>
    [HttpGet("callback")]
    public async Task<IActionResult> GitHubCallback([FromQuery] string code)
    {
        try
        {
            if (string.IsNullOrEmpty(code))
            {
                return BadRequest("No code provided");
            }

            // Exchange code for access token
            var tokenResponse = await ExchangeCodeForToken(code);
            
            if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                return BadRequest("Failed to get access token");
            }

            // Get user info from GitHub
            var githubUser = await GetGitHubUser(tokenResponse.AccessToken);
            
            if (githubUser == null)
            {
                return BadRequest("Failed to get user info");
            }

            // Register or login user
            var authResult = await _authService.RegisterOrLoginWithGitHub(
                githubUser.Email ?? $"{githubUser.Login}@github.com",
                githubUser.Name ?? githubUser.Login,
                githubUser.AvatarUrl
            );

            if (!authResult.Success)
            {
                return BadRequest(authResult.Message);
            }

            // Redirect to frontend with token
            var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:3000";
            return Redirect($"{frontendUrl}/auth/callback?token={authResult.Token}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GitHub OAuth callback failed");
            return StatusCode(500, "OAuth authentication failed");
        }
    }

    private async Task<GitHubTokenResponse?> ExchangeCodeForToken(string code)
    {
        var clientId = _configuration["GitHub:ClientId"];
        var clientSecret = _configuration["GitHub:ClientSecret"];

        var requestData = new
        {
            client_id = clientId,
            client_secret = clientSecret,
            code = code
        };

        var response = await _httpClient.PostAsJsonAsync(
            "https://github.com/login/oauth/access_token",
            requestData);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var content = await response.Content.ReadAsStringAsync();
        var tokenData = ParseQueryString(content);

        return new GitHubTokenResponse
        {
            AccessToken = tokenData.GetValueOrDefault("access_token") ?? "",
            TokenType = tokenData.GetValueOrDefault("token_type") ?? "",
            Scope = tokenData.GetValueOrDefault("scope") ?? ""
        };
    }

    private async Task<GitHubUser?> GetGitHubUser(string accessToken)
    {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "CodeReviewer-AI");

        var response = await _httpClient.GetAsync("https://api.github.com/user");

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<GitHubUser>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    private Dictionary<string, string> ParseQueryString(string queryString)
    {
        var result = new Dictionary<string, string>();
        var pairs = queryString.Split('&');

        foreach (var pair in pairs)
        {
            var parts = pair.Split('=');
            if (parts.Length == 2)
            {
                result[parts[0]] = Uri.UnescapeDataString(parts[1]);
            }
        }

        return result;
    }
}

public class GitHubTokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
}

public class GitHubUser
{
    public string Login { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string AvatarUrl { get; set; } = string.Empty;
}