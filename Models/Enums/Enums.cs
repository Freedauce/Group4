namespace FinalExam3.Models.Enums
{
    public enum UserRole
    {
        Admin = 1,
        Manager = 2,
        CarOwner = 3,
        Client = 4
    }

    public enum ApprovalStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3
    }

    public enum BookingStatus
    {
        Pending = 1,
        Confirmed = 2,
        InProgress = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Paid = 2,
        Failed = 3
    }

    public enum CarStatus
    {
        PendingApproval = 1,
        Available = 2,
        Rented = 3,
        Maintenance = 4,
        Unavailable = 5
    }

    public enum NotificationType
    {
        BookingCreated = 1,
        BookingConfirmed = 2,
        BookingCancelled = 3,
        PaymentReceived = 4,
        CarApproved = 5,
        CarRejected = 6,
        AccountApproved = 7,
        AccountRejected = 8,
        PasswordReset = 9
    }
}
