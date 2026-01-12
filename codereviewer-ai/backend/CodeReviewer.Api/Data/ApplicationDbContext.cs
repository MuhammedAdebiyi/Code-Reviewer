using Microsoft.EntityFrameworkCore;
using CodeReviewer.Api.Models;

namespace CodeReviewer.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<CodeReview> CodeReviews { get; set; } = null!;
    public DbSet<AnalysisResult> AnalysisResults { get; set; } = null!;
    public DbSet<ChatMessage> ChatMessages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.ApiKey).IsUnique();
            
            entity.HasMany(e => e.Reviews)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CodeReview configuration
        modelBuilder.Entity<CodeReview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Status);
            
            entity.HasMany(e => e.Results)
                .WithOne(e => e.Review)
                .HasForeignKey(e => e.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AnalysisResult configuration
        modelBuilder.Entity<AnalysisResult>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReviewId);
            entity.HasIndex(e => e.Severity);
        });

        // ChatMessage configuration
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReviewId);
            entity.HasIndex(e => e.UserId);
        });
    }
}