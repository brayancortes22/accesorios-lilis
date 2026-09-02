namespace AccesoriosLilis.Api.Entity.Dtos;

public class CreateAdminUserRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
}
