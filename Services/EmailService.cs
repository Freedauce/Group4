using FinalExam3.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace FinalExam3.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _senderEmail;
        private readonly string _senderName;
        private readonly string _password;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            _senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "";
            _senderName = _configuration["EmailSettings:SenderName"] ?? "Kigali Rental";
            _password = _configuration["EmailSettings:Password"] ?? "";
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = false)
        {
            if (string.IsNullOrEmpty(_senderEmail) || string.IsNullOrEmpty(_password))
            {
                _logger.LogWarning("Email not configured. Simulating email send.");
                _logger.LogInformation($"=== EMAIL SIMULATION ===");
                _logger.LogInformation($"To: {toEmail}");
                _logger.LogInformation($"Subject: {subject}");
                _logger.LogInformation($"Body: {body}");
                _logger.LogInformation($"========================");
                return;
            }

            try
            {
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    Credentials = new NetworkCredential(_senderEmail, _password),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_senderEmail, _senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation($"Email sent successfully to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {toEmail}");
                // Don't throw - email failure shouldn't break the application
            }
        }

        public async Task SendVerificationEmailAsync(string email, string token)
        {
            var subject = "Verify your Kigali Rental account";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #E94560;'>Welcome to Kigali Rental!</h2>
        <p>Thank you for registering with us. Please verify your email address by clicking the link below:</p>
        <p style='margin: 30px 0;'>
            <a href='https://kigalidrive.com/verify?token={token}' 
               style='background-color: #E94560; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;'>
                Verify Email
            </a>
        </p>
        <p style='color: #666; font-size: 14px;'>If you didn't create an account, please ignore this email.</p>
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendPasswordResetEmailAsync(string email, string token)
        {
            var subject = "Reset your Kigali Rental password";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #E94560;'>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style='margin: 30px 0;'>
            <a href='https://kigalidrive.com/reset-password?token={token}' 
               style='background-color: #E94560; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;'>
                Reset Password
            </a>
        </p>
        <p style='color: #666; font-size: 14px;'>This link expires in 24 hours.</p>
        <p style='color: #666; font-size: 14px;'>If you didn't request a password reset, please ignore this email.</p>
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendApprovalNotificationAsync(string email, bool approved, string message)
        {
            var subject = approved ? "Your Kigali Rental Account is Approved!" : "Kigali Rental Account Status Update";
            var statusColor = approved ? "#28a745" : "#dc3545";
            var statusText = approved ? "Approved ✓" : "Not Approved";
            
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #E94560;'>Account Status Update</h2>
        <div style='background-color: {statusColor}; color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; margin: 20px 0;'>
            {statusText}
        </div>
        <p>{(approved ? "Congratulations! Your account has been approved. You can now log in and start using Kigali Rental." : "Unfortunately, your account was not approved at this time.")}</p>
        {(!string.IsNullOrEmpty(message) ? $"<p><strong>Message:</strong> {message}</p>" : "")}
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendBookingConfirmationAsync(string email, int bookingId, string carName, DateTime startDate, DateTime endDate)
        {
            var subject = $"Booking Confirmation #{bookingId} - Kigali Rental";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #E94560;'>🎉 Booking Confirmed!</h2>
        <p>Great news! Your booking has been confirmed. Here are the details:</p>
        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
            <p><strong>Booking ID:</strong> #{bookingId}</p>
            <p><strong>Vehicle:</strong> {carName}</p>
            <p><strong>Pick-up Date:</strong> {startDate:MMMM dd, yyyy}</p>
            <p><strong>Return Date:</strong> {endDate:MMMM dd, yyyy}</p>
        </div>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Safe travels!</p>
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendPaymentConfirmationAsync(string email, decimal amount, string transactionRef)
        {
            var subject = "Payment Confirmation - Kigali Rental";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #28a745;'>💰 Payment Received!</h2>
        <p>Thank you! Your payment has been successfully processed.</p>
        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
            <p><strong>Amount:</strong> ${amount:F2}</p>
            <p><strong>Transaction Reference:</strong> {transactionRef}</p>
            <p><strong>Date:</strong> {DateTime.UtcNow:MMMM dd, yyyy HH:mm} UTC</p>
        </div>
        <p>Your booking is now active. Enjoy your ride!</p>
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendCeoWelcomeEmailAsync(string email, string firstName)
        {
            var subject = "Welcome to Kigali Rental";
            var body = $@"
<html>
<body style='font-family: Georgia, serif; line-height: 1.8; color: #333; background-color: #f5f5f5;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 40px; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #E94560; margin: 0;'>🚗 Kigali Rental</h1>
            <p style='color: #666; font-style: italic;'>Your trusted car rental partner in Rwanda</p>
        </div>
        
        <p style='font-size: 18px;'>Dear <strong>{firstName}</strong>,</p>
        
        <p>Welcome to Kigali Rental! I'm <strong>Ntiganzwa Kagimba</strong>, the CEO, and I'm personally thrilled to have you join our growing community.</p>
        
        <p>At Kigali Rental, we're more than just a car rental company — we're your trusted partner for exploring the beautiful <em>Land of a Thousand Hills</em>. Whether you're a tourist discovering Rwanda's breathtaking landscapes, a business professional needing reliable transportation, or a local looking for the perfect ride, we've got you covered.</p>
        
        <div style='background: linear-gradient(135deg, #E94560 0%, #0A1931 100%); color: white; padding: 25px; border-radius: 8px; margin: 30px 0;'>
            <h3 style='margin-top: 0; color: white;'>Here's what makes us special:</h3>
            <ul style='list-style: none; padding: 0; margin: 0;'>
                <li style='margin: 10px 0;'>✅ Premium, well-maintained vehicles</li>
                <li style='margin: 10px 0;'>✅ Competitive prices with transparent pricing</li>
                <li style='margin: 10px 0;'>✅ 24/7 customer support</li>
                <li style='margin: 10px 0;'>✅ Easy online booking</li>
            </ul>
        </div>
        
        <p>I encourage you to explore our selection of vehicles and find the perfect car for your journey. If you ever have questions or need assistance, don't hesitate to reach out — we're here for you.</p>
        
        <p style='font-size: 18px;'><strong>Safe travels and welcome aboard!</strong></p>
        
        <div style='margin-top: 40px; padding-top: 20px; border-top: 2px solid #E94560;'>
            <p style='margin: 0;'><strong>Warm regards,</strong></p>
            <p style='font-size: 20px; color: #E94560; margin: 10px 0;'><strong>Ntiganzwa Kagimba</strong></p>
            <p style='margin: 0; color: #666;'>Chief Executive Officer</p>
            <p style='margin: 0; color: #666;'>Kigali Rental</p>
            <p style='margin: 15px 0 0 0; color: #888; font-size: 14px;'>
                📞 +250 780 873 647<br>
                📧 theophilentiganzwa@gmail.com
            </p>
        </div>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px; text-align: center;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(email, subject, body, true);
        }

        public async Task SendOwnerContactEmailAsync(string clientEmail, string clientName, string carName, string ownerName, string ownerPhone, string ownerEmail, DateTime startDate, DateTime endDate)
        {
            var subject = "🚗 Your Car is Ready! - Owner Contact Details";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f5f5f5;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 40px; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #28a745; margin: 0;'>✅ Payment Confirmed!</h1>
            <p style='color: #666;'>Your booking is now active</p>
        </div>
        
        <p style='font-size: 18px;'>Dear <strong>{clientName}</strong>,</p>
        
        <p>Great news! Your payment has been confirmed and your booking for <strong>{carName}</strong> is now active.</p>
        
        <div style='background: linear-gradient(135deg, #E94560 0%, #0A1931 100%); color: white; padding: 25px; border-radius: 8px; margin: 30px 0;'>
            <h3 style='margin-top: 0; color: white; text-align: center;'>📅 Booking Details</h3>
            <p style='margin: 10px 0;'><strong>Car:</strong> {carName}</p>
            <p style='margin: 10px 0;'><strong>Pick-up Date:</strong> {startDate:MMMM dd, yyyy}</p>
            <p style='margin: 10px 0;'><strong>Return Date:</strong> {endDate:MMMM dd, yyyy}</p>
        </div>
        
        <div style='background-color: #f8f9fa; border: 2px solid #28a745; padding: 25px; border-radius: 8px; margin: 30px 0;'>
            <h3 style='margin-top: 0; color: #28a745; text-align: center;'>📞 Contact Your Car Owner</h3>
            <p style='margin: 15px 0; font-size: 16px;'><strong>Owner Name:</strong> {ownerName}</p>
            <p style='margin: 15px 0; font-size: 20px; text-align: center;'>
                <a href='tel:{ownerPhone}' style='background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                    📞 Call: {ownerPhone ?? "Not Available"}
                </a>
            </p>
            <p style='margin: 15px 0; text-align: center;'>
                <a href='mailto:{ownerEmail}' style='color: #E94560; text-decoration: none;'>
                    📧 {ownerEmail}
                </a>
            </p>
        </div>
        
        <p>Please contact the car owner to arrange the pick-up details. They are expecting your call!</p>
        
        <p style='font-size: 18px;'><strong>Enjoy your ride! 🚗</strong></p>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px; text-align: center;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(clientEmail, subject, body, true);
        }

        public async Task SendNewCarNotificationAsync(string managerEmail, string carName, string ownerName, string ownerEmail)
        {
            var subject = "🚗 New Car Listed - Approval Required";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f5f5f5;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 40px; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #E94560; margin: 0;'>🚗 New Car Listed</h1>
            <p style='color: #666;'>A new car is waiting for your approval</p>
        </div>
        
        <div style='background-color: #f8f9fa; border-left: 4px solid #E94560; padding: 20px; border-radius: 5px; margin: 30px 0;'>
            <h3 style='margin-top: 0; color: #E94560;'>Car Details</h3>
            <p style='margin: 10px 0;'><strong>Vehicle:</strong> {carName}</p>
            <p style='margin: 10px 0;'><strong>Owner:</strong> {ownerName}</p>
            <p style='margin: 10px 0;'><strong>Owner Email:</strong> {ownerEmail}</p>
        </div>
        
        <p>Please log in to the admin panel to review and approve this listing.</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='http://localhost:5173/pending-cars' style='background-color: #E94560; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                Review Car Listing
            </a>
        </div>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px; text-align: center;'>© 2024 Kigali Rental. Admin Notification.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(managerEmail, subject, body, true);
        }

        public async Task SendLoginVerificationCodeAsync(string email, string firstName, string code)
        {
            var subject = "🔐 Your Login Verification Code - Kigali Rental";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f5f5f5;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 40px; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #E94560; margin: 0;'>🔐 Verification Code</h1>
            <p style='color: #666;'>Complete your login to Kigali Rental</p>
        </div>
        
        <p style='font-size: 18px;'>Hello <strong>{firstName}</strong>,</p>
        
        <p>Your verification code is:</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <div style='background: linear-gradient(135deg, #E94560 0%, #0A1931 100%); color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 25px 40px; display: inline-block; border-radius: 10px;'>
                {code}
            </div>
        </div>
        
        <p style='color: #666; text-align: center;'>This code will expire in <strong>5 minutes</strong>.</p>
        
        <div style='background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;'>
            <strong>⚠️ Security Notice:</strong><br>
            If you didn't try to log in, please ignore this email and ensure your account is secure.
        </div>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        <p style='color: #999; font-size: 12px; text-align: center;'>© 2024 Kigali Rental. All rights reserved.</p>
    </div>
</body>
</html>";

            await SendEmailAsync(email, subject, body, true);
        }
    }
}
