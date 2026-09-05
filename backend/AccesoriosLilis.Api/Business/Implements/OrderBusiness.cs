using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using AccesoriosLilis.Api.Utilities.Exceptions;
using AccesoriosLilis.Api.Utilities.Mappers;
using AccesoriosLilis.Api.Utilities.Security;

namespace AccesoriosLilis.Api.Business.Implements;

public class OrderBusiness : BaseBusiness<Order, OrderDto>, IOrderBusiness
{
    private readonly IOrderData _orderData;
    private readonly IProductData _productData;
    private readonly ApplicationDbContext _context;

    public OrderBusiness(IOrderData orderData, IProductData productData, ApplicationDbContext context) : base(orderData)
    {
        _orderData = orderData;
        _productData = productData;
        _context = context;
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

        // Sanitización de entradas para prevenir XSS y scripts maliciosos en base de datos
        var sanitizedClientName = InputSanitizer.Sanitize(request.ClientName, 150);
        var sanitizedPhone = InputSanitizer.Sanitize(request.Phone, 30);
        var sanitizedCity = InputSanitizer.Sanitize(request.City, 150);
        var sanitizedNotes = InputSanitizer.Sanitize(request.Notes, 1000);

        // Transacción atómica de base de datos: asegura consistencia de inventario y pedido
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Get or create customer
            var customer = await _orderData.GetOrCreateCustomerAsync(
                sanitizedClientName,
                sanitizedPhone,
                sanitizedCity,
                sanitizedNotes
            );

            var isCustomOrder = !string.IsNullOrWhiteSpace(sanitizedNotes) && 
                                sanitizedNotes.Contains("[POR ENCARGO]", StringComparison.OrdinalIgnoreCase);

            // 2. Validate and calculate items
            var order = new Order
            {
                CustomerId = customer.Id,
                Customer = customer,
                Status = isCustomOrder ? "Por Encargo" : "Pendiente",
                Notes = sanitizedNotes,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            decimal total = 0;
            foreach (var item in request.Items)
            {
                var quantity = item.Quantity > 0 ? item.Quantity : 1;
                var unitPrice = item.Price;
                if (item.Id > 0)
                {
                    var product = await _productData.GetByIdAsync(item.Id);
                    if (product != null)
                    {
                        if (!isCustomOrder)
                        {
                            if (product.Stock < quantity)
                            {
                                throw new BusinessException($"No hay suficiente stock para '{product.Name}'. Stock disponible: {product.Stock}, solicitado: {quantity}.");
                            }
                            // Descontar inventario físico de entrega inmediata de forma atómica
                            product.Stock = Math.Max(0, product.Stock - quantity);
                            await _productData.UpdateAsync(product.Id, product);
                        }
                        unitPrice = product.Price;
                    }
                }

                var orderItem = new OrderItem
                {
                    ProductId = item.Id > 0 ? item.Id : 1,
                    Quantity = quantity,
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

            // Confirmar transacción atómica
            await transaction.CommitAsync();

            // 4. Return formatted response using OrderMapper
            return created.ToResponseDto();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
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
