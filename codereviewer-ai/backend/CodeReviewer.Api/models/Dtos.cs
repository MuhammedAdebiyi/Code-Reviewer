namespace CodeReviewer.Api.Models;

// Authentication DTOs
public record AuthResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public string? Token { get; init; }
    public string? RefreshToken { get; init; }
    public UserDto? User { get; init; }
}

public record UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Plan { get; init; } = "free";
    public int ReviewsRemaining { get; init; }
    public DateTime CreatedAt { get; init; }
}

// Code Review DTOs
public record CodeFileDto
{
    public string Path { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string? Language { get; init; }
}

public record ReviewDto
{
    public Guid Id { get; init; }
    public string ProjectName { get; init; } = string.Empty;
    public string Language { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int FilesCount { get; init; }
    public int TotalLines { get; init; }
    public DateTime StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}

public record ReviewResultsResponse
{
    public Guid ReviewId { get; init; }
    public string Status { get; init; } = string.Empty;
    public ReviewSummary Summary { get; init; } = new();
    public List<IssueDto> Issues { get; init; } = new();
    public string ArchitectureAnalysis { get; init; } = string.Empty;
    public int FilesAnalyzed { get; init; }
    public int TotalLines { get; init; }
}

public record ReviewSummary
{
    public int Total { get; init; }
    public int Critical { get; init; }
    public int High { get; init; }
    public int Medium { get; init; }
    public int Low { get; init; }
    public Dictionary<string, int> ByType { get; init; } = new();
}

public record IssueDto
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Severity { get; init; } = string.Empty;
    public string File { get; init; } = string.Empty;
    public int Line { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Suggestion { get; init; } = string.Empty;
    public string Reasoning { get; init; } = string.Empty;
    public string CodeSnippet { get; init; } = string.Empty;
}