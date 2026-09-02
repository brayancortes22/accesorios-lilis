using AccesoriosLilis.Api.Entity.Model.Base;

namespace AccesoriosLilis.Api.Entity.Model;

public class OrderItem : BaseModel
{
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
}
