using AccesoriosLilis.Api.Entity.Dtos;

namespace AccesoriosLilis.Api.Business.Interfaces;

public interface IAuthBusiness
{
    Task<AuthResponseDto> AuthenticateWithGoogleAsync(GoogleLoginRequestDto request);
    Task<AuthResponseDto> DevLoginAsync(DevLoginRequestDto request);
    Task<UserInfoDto> GetCurrentUserAsync(string email);
}
