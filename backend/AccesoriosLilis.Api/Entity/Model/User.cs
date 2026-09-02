using AccesoriosLilis.Api.Entity.Model.Base;

namespace AccesoriosLilis.Api.Entity.Model;

public class User : BaseModel
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // "Admin" or "Customer"
    public string? PictureUrl { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
