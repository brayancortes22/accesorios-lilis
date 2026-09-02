using AccesoriosLilis.Api.Entity.Model.Base;

namespace AccesoriosLilis.Api.Entity.Model;

public class Order : BaseModel
{
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "Pendiente";
    public string? Notes { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
