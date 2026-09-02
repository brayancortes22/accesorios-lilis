using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Data.Interfaces;

public interface IOrderData : IBaseData<Order>
{
    Task<List<Order>> GetOrdersWithDetailsAsync();
    Task<Order?> GetOrderWithDetailsByIdAsync(int id);
    Task<Customer> GetOrCreateCustomerAsync(string name, string phone, string? city, string? notes);
    Task<bool> UpdateStatusAsync(int orderId, string status);
}
