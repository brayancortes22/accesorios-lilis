using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using AccesoriosLilis.Api.Utilities.Exceptions;
using AccesoriosLilis.Api.Utilities.Mappers;

namespace AccesoriosLilis.Api.Business.Implements;

public class OrderBusiness : BaseBusiness<Order, OrderDto>, IOrderBusiness
{
    private readonly IOrderData _orderData;
    private readonly IProductData _productData;

    public OrderBusiness(IOrderData orderData, IProductData productData) : base(orderData)
    {
        _orderData = orderData;
        _productData = productData;
    }

    public override async Task<Order> CreateAsync(OrderDto dto)
    {
        var order = dto.ToEntity();
        return await _data.CreateAsync(order);
    }

    public override async Task<Order?> UpdateAsync(int id, OrderDto dto)
    {
        var current = await _data.GetByIdAsync(id);
        if (current is null) return null;

        current.Status = string.IsNullOrWhiteSpace(dto.Status) ? current.Status : dto.Status.Trim();
        current.Notes = dto.Notes ?? current.Notes;
        current.Total = dto.Total > 0 ? dto.Total : current.Total;
        current.IsActive = dto.IsActive;
        current.UpdatedAt = DateTime.UtcNow;

        return await _data.UpdateAsync(id, current);
    }

    public async Task<OrderResponseDto> CreateOrderFromStoreAsync(CreateOrderRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ClientName))
        {
            throw new BusinessException("El nombre del cliente es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Phone))
        {
            throw new BusinessException("El teléfono de contacto es obligatorio.");
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            throw new BusinessException("El pedido debe contener al menos un producto.");
        }

        // 1. Get or create customer
        var customer = await _orderData.GetOrCreateCustomerAsync(
            request.ClientName.Trim(),
            request.Phone.Trim(),
            request.City?.Trim(),
            request.Notes?.Trim()
        );

        // 2. Validate and calculate items
        var order = new Order
        {
            CustomerId = customer.Id,
            Customer = customer,
            Status = "Pendiente",
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        decimal total = 0;
        foreach (var item in request.Items)
        {
            var unitPrice = item.Price;
            if (item.Id > 0)
            {
                var product = await _productData.GetByIdAsync(item.Id);
                if (product != null)
                {
                    unitPrice = product.Price;
                }
            }

            var orderItem = new OrderItem
            {
                ProductId = item.Id > 0 ? item.Id : 1,
                Quantity = item.Quantity > 0 ? item.Quantity : 1,
                UnitPrice = unitPrice,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            total += orderItem.UnitPrice * orderItem.Quantity;
            order.Items.Add(orderItem);
        }

        order.Total = total;

        // 3. Persist order
        var created = await _orderData.CreateAsync(order);
        created.Customer = customer;

        // 4. Return formatted response using OrderMapper
        return created.ToResponseDto();
    }

    public async Task<List<Order>> GetOrdersWithDetailsAsync()
    {
        return await _orderData.GetOrdersWithDetailsAsync();
    }

    public async Task<Order?> GetOrderWithDetailsByIdAsync(int id)
    {
        return await _orderData.GetOrderWithDetailsByIdAsync(id);
    }

    public async Task<bool> UpdateStatusAsync(int orderId, string status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            throw new BusinessException("El estado no puede estar vacío.");
        }

        return await _orderData.UpdateStatusAsync(orderId, status.Trim());
    }
}
