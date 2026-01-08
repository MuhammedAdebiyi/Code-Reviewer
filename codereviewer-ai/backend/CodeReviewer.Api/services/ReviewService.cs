using Microsoft.EntityFrameworkCore;
using CodeReviewer.Api.Data;
using CodeReviewer.Api.Models;
using System.Text.Json;

namespace CodeReviewer.Api.Services;

public interface IReviewService
{
    Task<CodeReview> CreateReviewAsync(Guid userId, string projectName, string language, int filesCount);
    Task<CodeReview?> GetReviewAsync(Guid reviewId, Guid userId);
    Task<ReviewResultsResponse?> GetReviewWithResultsAsync(Guid reviewId, Guid userId);
    Task<List<ReviewDto>> GetUserReviewsAsync(Guid userId, int page, int pageSize);
    Task UpdateStatusAsync(Guid reviewId, string status);
    Task SaveAnalysisResultsAsync(Guid reviewId, dynamic analysisResult);
    Task<string> GetAnalysisContextAsync(Guid reviewId);
    Task SaveChatMessageAsync(Guid reviewId, Guid userId, string message, string response);
    Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId);
}

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(ApplicationDbContext context, ILogger<ReviewService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CodeReview> CreateReviewAsync(
        Guid userId,
        string projectName,
        string language,
        int filesCount)
    {
        var review = new CodeReview
        {
            UserId = userId,
            ProjectName = projectName,
            Language = language,
            FilesCount = filesCount,
            Status = "pending"
        };

        _context.CodeReviews.Add(review);
        await _context.SaveChangesAsync();

        return review;
    }

    public async Task<CodeReview?> GetReviewAsync(Guid reviewId, Guid userId)
    {
        return await _context.CodeReviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);
    }

    public async Task<ReviewResultsResponse?> GetReviewWithResultsAsync(Guid reviewId, Guid userId)
    {
        var review = await _context.CodeReviews
            .Include(r => r.Results)
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

        if (review == null)
            return null;

        var issues = review.Results.Select(r => new IssueDto
        {
            Id = r.Id.ToString(),
            Type = r.IssueType,
            Severity = r.Severity,
            File = r.File,
            Line = r.LineNumber,
            Title = r.Title,
            Description = r.Description,
            Suggestion = r.Suggestion,
            Reasoning = r.Reasoning,
            CodeSnippet = r.CodeSnippet
        }).ToList();

        var summary = CalculateSummary(issues);

        return new ReviewResultsResponse
        {
            ReviewId = review.Id,
            Status = review.Status,
            Summary = summary,
            Issues = issues,
            ArchitectureAnalysis = "Architecture analysis will be added here",
            FilesAnalyzed = review.FilesCount,
            TotalLines = review.TotalLines
        };
    }

    public async Task<List<ReviewDto>> GetUserReviewsAsync(Guid userId, int page, int pageSize)
    {
        return await _context.CodeReviews
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProjectName = r.ProjectName,
                Language = r.Language,
                Status = r.Status,
                FilesCount = r.FilesCount,
                TotalLines = r.TotalLines,
                StartedAt = r.StartedAt,
                CompletedAt = r.CompletedAt
            })
            .ToListAsync();
    }

    public async Task UpdateStatusAsync(Guid reviewId, string status)
    {
        var review = await _context.CodeReviews.FindAsync(reviewId);
        
        if (review != null)
        {
            review.Status = status;
            
            if (status == "completed")
            {
                review.CompletedAt = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
        }
    }

    public async Task SaveAnalysisResultsAsync(Guid reviewId, dynamic analysisResult)
    {
        try
        {
            // Parse the AI service response
            var jsonString = JsonSerializer.Serialize(analysisResult);
            var result = JsonSerializer.Deserialize<JsonElement>(jsonString);

            // Extract issues from the response
            if (result.TryGetProperty("issues", out var issuesArray))
            {
                foreach (var issue in issuesArray.EnumerateArray())
                {
                    var analysisResultEntity = new AnalysisResult
                    {
                        ReviewId = reviewId,
                        IssueType = issue.GetProperty("type").GetString() ?? "quality",
                        Severity = issue.GetProperty("severity").GetString() ?? "medium",
                        Title = issue.GetProperty("title").GetString() ?? "",
                        Description = issue.GetProperty("description").GetString() ?? "",
                        File = issue.GetProperty("file").GetString() ?? "",
                        LineNumber = issue.GetProperty("line").GetInt32(),
                        CodeSnippet = issue.GetProperty("code_snippet").GetString() ?? "",
                        Suggestion = issue.GetProperty("suggestion").GetString() ?? "",
                        Reasoning = issue.GetProperty("reasoning").GetString() ?? ""
                    };

                    _context.AnalysisResults.Add(analysisResultEntity);
                }

                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save analysis results");
            throw;
        }
    }

    public async Task<string> GetAnalysisContextAsync(Guid reviewId)
    {
        var results = await _context.AnalysisResults
            .Where(r => r.ReviewId == reviewId)
            .Take(10) // Limit context to avoid token limits
            .ToListAsync();

        if (results.Count == 0)
            return "No analysis results found";

        var context = string.Join("\n\n", results.Select(r =>
            $"Issue: {r.Title}\nFile: {r.File}, Line: {r.LineNumber}\nDescription: {r.Description}"));

        return context;
    }

    public async Task SaveChatMessageAsync(Guid reviewId, Guid userId, string message, string response)
    {
        var userMessage = new ChatMessage
        {
            ReviewId = reviewId,
            UserId = userId,
            Role = "user",
            Message = message
        };

        var assistantMessage = new ChatMessage
        {
            ReviewId = reviewId,
            UserId = userId,
            Role = "assistant",
            Message = response
        };

        _context.ChatMessages.AddRange(userMessage, assistantMessage);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId)
    {
        var review = await _context.CodeReviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

        if (review == null)
            return false;

        _context.CodeReviews.Remove(review);
        await _context.SaveChangesAsync();

        return true;
    }

    private ReviewSummary CalculateSummary(List<IssueDto> issues)
    {
        var byType = issues
            .GroupBy(i => i.Type)
            .ToDictionary(g => g.Key, g => g.Count());

        return new ReviewSummary
        {
            Total = issues.Count,
            Critical = issues.Count(i => i.Severity == "critical"),
            High = issues.Count(i => i.Severity == "high"),
            Medium = issues.Count(i => i.Severity == "medium"),
            Low = issues.Count(i => i.Severity == "low"),
            ByType = byType
        };
    }
}