using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Business.Interfaces;

public interface IOrderBusiness : IBaseBusiness<Order, OrderDto>
{
    Task<OrderResponseDto> CreateOrderFromStoreAsync(CreateOrderRequestDto request);
    Task<List<Order>> GetOrdersWithDetailsAsync();
    Task<Order?> GetOrderWithDetailsByIdAsync(int id);
    Task<bool> UpdateStatusAsync(int orderId, string status);
}
