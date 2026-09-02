using AccesoriosLilis.Api.Entity.Dtos.Base;

namespace AccesoriosLilis.Api.Entity.Dtos;

public class OrderDto : BaseDto
{
    public int CustomerId { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "Pendiente";
    public string? Notes { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
