namespace FinalExam3.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string token);
        Task SendPasswordResetEmailAsync(string email, string token);
        Task SendApprovalNotificationAsync(string email, bool approved, string message);
        Task SendBookingConfirmationAsync(string email, int bookingId, string carName, DateTime startDate, DateTime endDate);
        Task SendPaymentConfirmationAsync(string email, decimal amount, string transactionRef);
        Task SendCeoWelcomeEmailAsync(string email, string firstName);
        Task SendOwnerContactEmailAsync(string clientEmail, string clientName, string carName, string ownerName, string ownerPhone, string ownerEmail, DateTime startDate, DateTime endDate);
        Task SendNewCarNotificationAsync(string managerEmail, string carName, string ownerName, string ownerEmail);
        Task SendLoginVerificationCodeAsync(string email, string firstName, string code);
    }
}
