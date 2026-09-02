using AccesoriosLilis.Api.Entity.Dtos.Base;

namespace AccesoriosLilis.Api.Entity.Dtos;

public class CategoryDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
