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

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
}

public class DevLoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string FullName { get; set; } = "Administrador";
}

public class ChangePasswordRequestDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserInfoDto User { get; set; } = new();
}

public class CheckEmailRequestDto
{
    public string Email { get; set; } = string.Empty;
}

public class CheckEmailResponseDto
{
    public bool Exists { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public bool HasPassword { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
