namespace AccesoriosLilis.Api.Entity.Dtos;

public class UserInfoDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // "Admin" or "Customer"
    public string? PictureUrl { get; set; }
}

public class GoogleLoginRequestDto
{
    public string IdToken { get; set; } = string.Empty;
    public string? CaptchaToken { get; set; }
}

public class DevLoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = "Administrador";
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserInfoDto User { get; set; } = new();
}
