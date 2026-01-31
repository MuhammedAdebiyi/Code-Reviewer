using System.ComponentModel.DataAnnotations;

namespace CodeReviewer.Api.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public string? ApiKey { get; set; }
    
    public string Plan { get; set; } = "free"; // free, pro, team
    
    public int ReviewsRemaining { get; set; } = 10;
    
    // Email Verification Fields
    public bool IsEmailVerified { get; set; } = false;
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiry { get; set; }
    public int VerificationAttempts { get; set; } = 0;
    public DateTime? LastVerificationAttempt { get; set; }
    
    // Password Reset Fields
    public string? PasswordResetCode { get; set; }
    public DateTime? PasswordResetCodeExpiry { get; set; }
    public int PasswordResetAttempts { get; set; } = 0;
    public DateTime? LastPasswordResetAttempt { get; set; }
    
    // Security Fields
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutUntil { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ICollection<CodeReview> Reviews { get; set; } = new List<CodeReview>();
}

// Keep your other models the same...
public class CodeReview
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid UserId { get; set; }
    
    public string ProjectName { get; set; } = string.Empty;
    
    public string Language { get; set; } = string.Empty;
    
    public string Status { get; set; } = "pending";
    
    public int FilesCount { get; set; }
    
    public int TotalLines { get; set; }
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    public int GeminiTokensUsed { get; set; }
    
    public User User { get; set; } = null!;
    public ICollection<AnalysisResult> Results { get; set; } = new List<AnalysisResult>();
}

public class AnalysisResult
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid ReviewId { get; set; }
    
    public string IssueType { get; set; } = string.Empty;
    
    public string Severity { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public string File { get; set; } = string.Empty;
    
    public int LineNumber { get; set; }
    
    public string CodeSnippet { get; set; } = string.Empty;
    
    public string Suggestion { get; set; } = string.Empty;
    
    public string Reasoning { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public CodeReview Review { get; set; } = null!;
}

public class ChatMessage
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid ReviewId { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public string Role { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public CodeReview Review { get; set; } = null!;
    public User User { get; set; } = null!;
}