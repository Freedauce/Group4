using FinalExam3.DTOs;
using FinalExam3.Models.Enums;

namespace FinalExam3.Services.Interfaces
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task CreateNotificationAsync(int userId, string title, string message, NotificationType type, int? relatedEntityId = null, string? relatedEntityType = null);
    }
}
