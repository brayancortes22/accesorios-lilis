using System.Security.Claims;
using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Utilities.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccesoriosLilis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthBusiness _authBusiness;

    public AuthController(IAuthBusiness authBusiness)
    {
        _authBusiness = authBusiness;
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponseDto>> GoogleLogin([FromBody] GoogleLoginRequestDto request)
    {
        try
        {
            var result = await _authBusiness.AuthenticateWithGoogleAsync(request);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error durante la autenticación con Google.", details = ex.Message });
        }
    }

    [HttpPost("dev-login")]
    public async Task<ActionResult<AuthResponseDto>> DevLogin([FromBody] DevLoginRequestDto request)
    {
        try
        {
            var result = await _authBusiness.DevLoginAsync(request);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserInfoDto>> GetCurrentProfile()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var name = User.FindFirstValue(ClaimTypes.Name);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Customer";
        var picture = User.FindFirstValue("picture");

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new { message = "No autenticado." });
        }

        var profile = await _authBusiness.GetCurrentUserAsync(email);
        profile.FullName = string.IsNullOrWhiteSpace(profile.FullName) ? name : profile.FullName;
        profile.PictureUrl = picture ?? profile.PictureUrl;

        return Ok(profile);
    }

    [HttpGet("health")]
    public ActionResult<object> Health()
    {
        return Ok(new
        {
            status = "ok",
            app = "Accesorios Lilis API",
            owner = "Liliana Lombana Polania",
            whatsapp = "+57 3174811570",
            facebook = "https://www.facebook.com/liliana.lombana.1"
        });
    }
}
