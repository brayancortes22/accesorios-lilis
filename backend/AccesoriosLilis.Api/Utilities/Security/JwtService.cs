using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AccesoriosLilis.Api.Entity.Dtos;
using Microsoft.IdentityModel.Tokens;

namespace AccesoriosLilis.Api.Utilities.Security;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(UserInfoDto user)
    {
        var secretKey = _configuration["Jwt:Key"]
            ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
            ?? "AccesoriosLilisSuperSecretKey2026SecureJwtToken123456789";

        var issuer = _configuration["Jwt:Issuer"] ?? "AccesoriosLilis";
        var audience = _configuration["Jwt:Audience"] ?? "AccesoriosLilis";
        var expireHours = int.TryParse(_configuration["Jwt:ExpireHours"], out var hours) ? hours : 48;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role),
            new("picture", user.PictureUrl ?? "")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(expireHours),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
