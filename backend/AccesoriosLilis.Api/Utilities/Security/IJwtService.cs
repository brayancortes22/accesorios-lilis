using AccesoriosLilis.Api.Entity.Dtos;

namespace AccesoriosLilis.Api.Utilities.Security;

public interface IJwtService
{
    string GenerateToken(UserInfoDto user);
}
