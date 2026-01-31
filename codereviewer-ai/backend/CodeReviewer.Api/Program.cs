using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using CodeReviewer.Api.Data;
using CodeReviewer.Api.Services;
using CodeReviewer.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);



builder.Configuration.AddEnvironmentVariables();

var connectionString = 
    
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") ??

    (
        !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DB_HOST")) ?
        $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
        $"Port={Environment.GetEnvironmentVariable("DB_PORT") ?? "5432"};" +
        $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
        $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
        $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")}"
        : null
    ) ??
   
    builder.Configuration.GetConnectionString("DefaultConnection");
if (connectionString == null)
{
    throw new InvalidOperationException("Database connection string is not configured!");
}



var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["Jwt:Secret"];

if (string.IsNullOrEmpty(jwtSecret))
{
    Console.WriteLine(" ERROR: JWT_SECRET is not configured!");
    throw new InvalidOperationException("JWT_SECRET is not configured. Check your .env file!");
}

if (jwtSecret.Length < 64)
{
    Console.WriteLine($"⚠ WARNING: JWT_SECRET is only {jwtSecret.Length} characters (minimum 64 recommended)");
}

Console.WriteLine($"✓ Connection string loaded: {connectionString.Replace(Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "", "***")}");


builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

Console.WriteLine("✓ Database context registered");


var jwtKey = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "CodeReviewer.Api",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "CodeReviewer.Client",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();


var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?? builder.Configuration["Cors:AllowedOrigins"]
    ?? "http://localhost:3000,http://localhost:3001";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policyBuilder =>
    {
        policyBuilder
            .WithOrigins(allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});


builder.Services.AddHttpClient("AiService", client =>
{
    var aiServiceUrl = Environment.GetEnvironmentVariable("AI_SERVICE_URL")
        ?? builder.Configuration["Services:AiService"]
        ?? "http://localhost:8000";
    
    Console.WriteLine($"✓ AI Service URL: {aiServiceUrl}");
    
    client.BaseAddress = new Uri(aiServiceUrl);
    client.Timeout = TimeSpan.FromMinutes(5);
});


builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<AiServiceClient>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddSingleton<RateLimitingService>();


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = builder.Environment.IsDevelopment();
    });

builder.Services.AddEndpointsApiExplorer();

// Swagger Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CodeReviewer API",
        Version = "v1",
        Description = "AI-powered code review platform API using Gemini 3",
        Contact = new OpenApiContact
        {
            Name = "CodeReviewer Team",
            Email = "support@codereviewer.ai"
        }
    });

    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


Console.WriteLine("Adding health checks...");
builder.Services.AddHealthChecks()
    .AddNpgSql(
        connectionString!,
        name: "postgres",
        tags: new[] { "db", "sql", "postgres" })
    .AddUrlGroup(
        new Uri(Environment.GetEnvironmentVariable("AI_SERVICE_URL") ?? "http://localhost:8000"),
        name: "ai-service",
        tags: new[] { "service", "ai" });
Console.WriteLine("✓ Health checks configured");



builder.Services.AddMemoryCache();


var app = builder.Build();


Console.WriteLine("CodeReviewer API - Starting...");

app.UseMiddleware<ErrorHandlingMiddleware>();

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
    
    await next();
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CodeReviewer API v1");
        c.RoutePrefix = string.Empty; 
    });
    Console.WriteLine("✓ Swagger enabled at http://localhost:5000");
}


if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");


app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<RateLimitingMiddleware>();
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");
app.MapHealthChecks("/health/live");
Console.WriteLine(" Health checks available at /health");
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        Console.WriteLine("Checking database migrations...");
        // Apply pending migrations
        dbContext.Database.Migrate();
        Console.WriteLine("✓ Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database migration error: {ex.Message}");
        app.Logger.LogError(ex, "An error occurred while migrating the database");
    }
}



Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"Listening on: http://localhost:5000");

app.Run();