using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodeReviewer.Api.Models;
using CodeReviewer.Api.Services;

namespace CodeReviewer.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly IAiServiceClient _aiClient;
    private readonly ILogger<ReviewController> _logger;

    public ReviewController(
        IReviewService reviewService,
        IAiServiceClient aiClient,
        ILogger<ReviewController> logger)
    {
        _reviewService = reviewService;
        _aiClient = aiClient;
        _logger = logger;
    }

    /// <summary>
    /// Submit code for review
    /// </summary>
    [HttpPost("submit")]
    public async Task<ActionResult<ReviewSubmitResponse>> SubmitReview([FromBody] ReviewSubmitRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized();
            }

            // Validate request
            if (request.Files == null || request.Files.Count == 0)
            {
                return BadRequest(new { message = "No files provided" });
            }

            // Create review record
            var review = await _reviewService.CreateReviewAsync(
                userId,
                request.ProjectName,
                request.Language,
                request.Files.Count
            );

            // Start analysis in background (don't await)
            _ = Task.Run(async () =>
            {
                try
                {
                    await _reviewService.UpdateStatusAsync(review.Id, "analyzing");

                    // Call AI service
                    var analysisResult = await _aiClient.AnalyzeCodeAsync(
                        request.Files,
                        request.Language
                    );

                    // Save results
                    await _reviewService.SaveAnalysisResultsAsync(review.Id, analysisResult);
                    await _reviewService.UpdateStatusAsync(review.Id, "completed");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Analysis failed for review {ReviewId}", review.Id);
                    await _reviewService.UpdateStatusAsync(review.Id, "failed");
                }
            });

            return Ok(new ReviewSubmitResponse
            {
                ReviewId = review.Id,
                Status = "pending",
                EstimatedTime = $"{request.Files.Count * 10}s",
                FilesCount = request.Files.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit review");
            return StatusCode(500, new { message = "Failed to submit review" });
        }
    }

    /// <summary>
    /// Get review status
    /// </summary>
    [HttpGet("{id}/status")]
    public async Task<ActionResult<ReviewStatusResponse>> GetStatus(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var review = await _reviewService.GetReviewAsync(id, userId);

            if (review == null)
            {
                return NotFound();
            }

            return Ok(new ReviewStatusResponse
            {
                ReviewId = review.Id,
                Status = review.Status,
                Progress = CalculateProgress(review.Status),
                FilesProcessed = review.FilesCount,
                FilesTotal = review.FilesCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get review status");
            return StatusCode(500, new { message = "Failed to get status" });
        }
    }

    /// <summary>
    /// Get review results
    /// </summary>
    [HttpGet("{id}/results")]
    public async Task<ActionResult<ReviewResultsResponse>> GetResults(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var review = await _reviewService.GetReviewWithResultsAsync(id, userId);

            if (review == null)
            {
                return NotFound();
            }

            if (review.Status != "completed")
            {
                return BadRequest(new { message = "Analysis not yet completed" });
            }

            return Ok(review);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get review results");
            return StatusCode(500, new { message = "Failed to get results" });
        }
    }

    /// <summary>
    /// Get all reviews for current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ReviewDto>>> GetMyReviews(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = GetUserId();
            var reviews = await _reviewService.GetUserReviewsAsync(userId, page, pageSize);

            return Ok(reviews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get user reviews");
            return StatusCode(500, new { message = "Failed to get reviews" });
        }
    }

    /// <summary>
    /// Chat about a review
    /// </summary>
    [HttpPost("{id}/chat")]
    public async Task<ActionResult<ChatResponse>> Chat(Guid id, [FromBody] ChatRequest request)
    {
        try
        {
            var userId = GetUserId();
            var review = await _reviewService.GetReviewAsync(id, userId);

            if (review == null)
            {
                return NotFound();
            }

            // Get analysis context
            var context = await _reviewService.GetAnalysisContextAsync(id);

            // Call AI service
            var response = await _aiClient.ChatAsync(id.ToString(), request.Message, context);

            // Save chat history
            await _reviewService.SaveChatMessageAsync(id, userId, request.Message, response);

            return Ok(new ChatResponse
            {
                ReviewId = id.ToString(),
                Response = response,
                ConversationId = id.ToString()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat failed for review {ReviewId}", id);
            return StatusCode(500, new { message = "Chat failed" });
        }
    }

    /// <summary>
    /// Delete a review
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteReview(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var deleted = await _reviewService.DeleteReviewAsync(id, userId);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete review");
            return StatusCode(500, new { message = "Failed to delete review" });
        }
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return string.IsNullOrEmpty(userIdClaim) ? Guid.Empty : Guid.Parse(userIdClaim);
    }

    private int CalculateProgress(string status)
    {
        return status switch
        {
            "pending" => 10,
            "analyzing" => 50,
            "completed" => 100,
            "failed" => 0,
            _ => 0
        };
    }
}

// Request/Response models
public record ReviewSubmitRequest(string ProjectName, string Language, List<CodeFileDto> Files);
public record ReviewSubmitResponse
{
    public Guid ReviewId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string EstimatedTime { get; init; } = string.Empty;
    public int FilesCount { get; init; }
}

public record ReviewStatusResponse
{
    public Guid ReviewId { get; init; }
    public string Status { get; init; } = string.Empty;
    public int Progress { get; init; }
    public int FilesProcessed { get; init; }
    public int FilesTotal { get; init; }
}

public record ChatRequest(string Message);
public record ChatResponse
{
    public string ReviewId { get; init; } = string.Empty;
    public string Response { get; init; } = string.Empty;
    public string ConversationId { get; init; } = string.Empty;
}