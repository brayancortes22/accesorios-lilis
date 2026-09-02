namespace AccesoriosLilis.Api.Entity.Dtos;

public class CreateOrderRequestDto
{
    public string ClientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? City { get; set; } = "Algeciras";
    public string? Notes { get; set; }
    public List<CreateOrderItemRequestDto> Items { get; set; } = new();
}

public class CreateOrderItemRequestDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class OrderResponseDto
{
    public OrderSummaryDto Order { get; set; } = new();
    public string TotalLabel { get; set; } = string.Empty;
}

public class OrderSummaryDto
{
    public int Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ItemCount { get; set; }
}
