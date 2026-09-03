using AccesoriosLilis.Api.Entity.Dtos;

namespace AccesoriosLilis.Api.Business.Interfaces;

public interface IAuthBusiness
{
    Task<AuthResponseDto> AuthenticateWithGoogleAsync(GoogleLoginRequestDto request);
    Task<AuthResponseDto> LoginWithPasswordAsync(LoginRequestDto request);
    Task<AuthResponseDto> DevLoginAsync(DevLoginRequestDto request);
    Task<bool> ChangePasswordAsync(string email, ChangePasswordRequestDto request);
    Task<CheckEmailResponseDto> CheckEmailAsync(CheckEmailRequestDto request);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<UserInfoDto> GetCurrentUserAsync(string email);
}
