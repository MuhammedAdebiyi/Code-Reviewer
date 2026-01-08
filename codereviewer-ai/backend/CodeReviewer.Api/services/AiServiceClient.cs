using System.Text;
using System.Text.Json;
using CodeReviewer.Api.Models;

namespace CodeReviewer.Api.Services;

public interface IAiServiceClient
{
    Task<dynamic> AnalyzeCodeAsync(List<CodeFileDto> files, string language);
    Task<string> ChatAsync(string reviewId, string message, string? context = null);
}

public class AiServiceClient : IAiServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiServiceClient> _logger;

    public AiServiceClient(HttpClient httpClient, ILogger<AiServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<dynamic> AnalyzeCodeAsync(List<CodeFileDto> files, string language)
    {
        try
        {
            var request = new
            {
                files = files.Select(f => new
                {
                    path = f.Path,
                    content = f.Content,
                    language = f.Language ?? language
                }).ToList(),
                language,
                focus_areas = new[] { "security", "performance", "quality", "architecture" }
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/analyze", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("AI service returned error: {Error}", errorContent);
                throw new Exception($"AI service error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<dynamic>(responseContent);

            return result!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze code");
            throw;
        }
    }

    public async Task<string> ChatAsync(string reviewId, string message, string? context = null)
    {
        try
        {
            var request = new
            {
                review_id = reviewId,
                message,
                context
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/chat", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Chat service returned error: {Error}", errorContent);
                throw new Exception($"Chat service error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);

            return result.GetProperty("response").GetString() ?? "No response";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat failed");
            throw;
        }
    }
}