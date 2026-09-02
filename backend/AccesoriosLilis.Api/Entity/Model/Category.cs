using AccesoriosLilis.Api.Entity.Model.Base;

namespace AccesoriosLilis.Api.Entity.Model;

public class Category : BaseModel
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
