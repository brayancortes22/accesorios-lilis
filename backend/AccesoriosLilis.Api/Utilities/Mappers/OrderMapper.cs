using System.Globalization;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Utilities.Mappers;

public static class OrderMapper
{
    private static readonly CultureInfo CopCulture = new("es-CO");

    public static Order ToEntity(this OrderDto dto)
    {
        var order = new Order
        {
            Id = dto.Id,
            CustomerId = dto.CustomerId,
            Total = dto.Total,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pendiente" : dto.Status.Trim(),
            Notes = dto.Notes,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.Items != null && dto.Items.Count > 0)
        {
            foreach (var item in dto.Items)
            {
                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity > 0 ? item.Quantity : 1,
                    UnitPrice = item.UnitPrice,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }
        }

        return order;
    }

    public static OrderDto ToDto(this Order entity)
    {
        return new OrderDto
        {
            Id = entity.Id,
            CustomerId = entity.CustomerId,
            Total = entity.Total,
            Status = entity.Status,
            Notes = entity.Notes,
            IsActive = entity.IsActive,
            Items = entity.Items?.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList() ?? new List<OrderItemDto>()
        };
    }

    public static OrderSummaryDto ToSummaryDto(this Order entity)
    {
        return new OrderSummaryDto
        {
            Id = entity.Id,
            ClientName = entity.Customer?.FullName ?? "Cliente Directo",
            Phone = entity.Customer?.Phone ?? "",
            Status = entity.Status,
            Total = entity.Total,
            CreatedAt = entity.CreatedAt,
            ItemCount = entity.Items?.Count ?? 0
        };
    }

    public static OrderResponseDto ToResponseDto(this Order entity)
    {
        return new OrderResponseDto
        {
            Order = entity.ToSummaryDto(),
            TotalLabel = entity.Total.ToString("C0", CopCulture)
        };
    }

    public static List<OrderSummaryDto> ToSummaryDtoList(this IEnumerable<Order> entities)
    {
        return entities.Select(ToSummaryDto).ToList();
    }
}
