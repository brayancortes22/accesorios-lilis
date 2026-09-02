using AccesoriosLilis.Api.Entity.Model.Base;

namespace AccesoriosLilis.Api.Entity.Model;

public class Product : BaseModel
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
