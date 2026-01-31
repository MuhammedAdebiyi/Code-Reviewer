namespace CodeReviewer.Api.Models;

// Auth DTOs
public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public UserDto? User { get; set; }
    public bool RequiresVerification { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
    public int ReviewsRemaining { get; set; }
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Review DTOs
public class ReviewDto
{
    public Guid Id { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int FilesCount { get; set; }
    public int TotalLines { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int GeminiTokensUsed { get; set; }
}

public class CodeFileDto
{
    public string Path { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
}

public class ReviewResultsResponse
{
    public Guid ReviewId { get; set; }
    public string Status { get; set; } = string.Empty;
    public ReviewSummary Summary { get; set; } = new();
    public List<FileResult> Files { get; set; } = new();
    public List<IssueDto> Issues { get; set; } = new();
    public string ArchitectureAnalysis { get; set; } = string.Empty;
    public int FilesAnalyzed { get; set; }
    public int TotalLines { get; set; }
}

public class ReviewSummary
{
    public int TotalIssues { get; set; }
    public int Total { get; set; }
    public int Critical { get; set; }
    public int High { get; set; }
    public int Medium { get; set; }
    public int Low { get; set; }
    public Dictionary<string, int> ByType { get; set; } = new();
}

public class FileResult
{
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public List<IssueDto> Issues { get; set; } = new();
}

public class IssueDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int LineNumber { get; set; }
    public int Line { get; set; }
    public string File { get; set; } = string.Empty;
    public string CodeSnippet { get; set; } = string.Empty;
    public string Suggestion { get; set; } = string.Empty;
    public string Reasoning { get; set; } = string.Empty;
    public string FixExample { get; set; } = string.Empty;
}