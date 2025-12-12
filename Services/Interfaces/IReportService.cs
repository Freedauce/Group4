using FinalExam3.DTOs;

namespace FinalExam3.Services.Interfaces
{
    public interface IReportService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<List<BookingsByMonthDto>> GetBookingsByMonthAsync(int year);
        Task<List<CarsByTypeDto>> GetCarsByTypeAsync();
        Task<List<RevenueReportDto>> GetRevenueReportAsync(DateTime startDate, DateTime endDate);
        Task<OwnerStatsDto> GetOwnerStatsAsync(int ownerId);
        Task<ClientStatsDto> GetClientStatsAsync(int clientId);
    }
}
