using System.Net;
using System.Net.Mail;

namespace CodeReviewer.Api.Services;

public interface IEmailService
{
    Task SendVerificationCodeAsync(string email, string code);
    Task SendPasswordResetCodeAsync(string email, string code);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendVerificationCodeAsync(string email, string code)
    {
        var subject = "Verify your CodeReviewer account";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; margin: 0; padding: 40px 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; }}
        .logo {{ text-align: center; margin-bottom: 32px; }}
        .logo-text {{ font-size: 24px; font-weight: bold; color: #fff; }}
        .code-box {{ background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; }}
        .code {{ font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #60a5fa; font-family: monospace; }}
        .message {{ color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }}
        .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); }}
        .warning {{ background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 16px; margin-top: 24px; color: #fca5a5; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>
            <div class='logo-text'> CodeReviewer</div>
        </div>
        
        <h1 style='font-size: 28px; margin-bottom: 16px;'>Verify your email</h1>
        
        <p class='message'>
            Thanks for signing up! Use the verification code below to complete your registration.
        </p>
        
        <div class='code-box'>
            <div class='code'>{code}</div>
        </div>
        
        <p class='message'>
            This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <div class='warning'>
             If you didn't request this code, please ignore this email.
        </div>
        
        <div class='footer'>
            <p>CodeReviewer AI - Powered by Gemini 3</p>
            <p>© 2026 CodeReviewer. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetCodeAsync(string email, string code)
    {
        var subject = "Reset your password";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; margin: 0; padding: 40px 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; }}
        .logo {{ text-align: center; margin-bottom: 32px; }}
        .logo-text {{ font-size: 24px; font-weight: bold; color: #fff; }}
        .code-box {{ background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; }}
        .code {{ font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #60a5fa; font-family: monospace; }}
        .message {{ color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }}
        .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); }}
        .warning {{ background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 16px; margin-top: 24px; color: #fca5a5; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>
            <div class='logo-text'> CodeReviewer</div>
        </div>
        
        <h1 style='font-size: 28px; margin-bottom: 16px;'>Reset your password</h1>
        
        <p class='message'>
            Use the code below to reset your password.
        </p>
        
        <div class='code-box'>
            <div class='code'>{code}</div>
        </div>
        
        <p class='message'>
            This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <div class='warning'>
             If you didn't request this, someone may be trying to access your account. Please secure your account immediately.
        </div>
        
        <div class='footer'>
            <p>CodeReviewer AI - Powered by Gemini 3</p>
            <p>© 2026 CodeReviewer. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? Environment.GetEnvironmentVariable("SMTP_HOST");
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"] ?? Environment.GetEnvironmentVariable("SMTP_USER");
            var smtpPass = _configuration["Email:SmtpPassword"] ?? Environment.GetEnvironmentVariable("SMTP_PASSWORD");
            var fromEmail = _configuration["Email:FromEmail"] ?? Environment.GetEnvironmentVariable("FROM_EMAIL") ?? "noreply@codereviewer.ai";
            var fromName = _configuration["Email:FromName"] ?? "CodeReviewer AI";

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
            {
                // In development, just log the code instead of sending email
                if (_configuration["Environment"] == "Development")
                {
                    _logger.LogInformation(" EMAIL (Development Mode)");
                    _logger.LogInformation("To: {Email}", toEmail);
                    _logger.LogInformation("Subject: {Subject}", subject);
                    _logger.LogInformation("Body: {Body}", body);
                    return;
                }

                throw new InvalidOperationException("Email configuration is missing. Set SMTP environment variables.");
            }

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUser, smtpPass)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation(" Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, " Failed to send email to {Email}", toEmail);
            throw;
        }
    }
}