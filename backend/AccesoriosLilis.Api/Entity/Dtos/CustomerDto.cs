using AccesoriosLilis.Api.Entity.Dtos.Base;

namespace AccesoriosLilis.Api.Entity.Dtos;

public class CustomerDto : BaseDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Notes { get; set; }
}
