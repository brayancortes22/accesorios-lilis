using System.ComponentModel.DataAnnotations.Schema;
using AccesoriosLilis.Api.Entity.Model.Base;

namespace AccesoriosLilis.Api.Entity.Model;

public class Category : BaseModel
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    [NotMapped]
    public int ProductCount { get; set; }

    [NotMapped]
    public bool HasProducts { get; set; }
}
