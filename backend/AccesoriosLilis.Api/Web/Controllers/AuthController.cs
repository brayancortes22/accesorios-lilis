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

    private void SetTokenCookie(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return;

        Response.Cookies.Append("accesorios_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/"
        });
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponseDto>> GoogleLogin([FromBody] GoogleLoginRequestDto request)
    {
        try
        {
            var result = await _authBusiness.AuthenticateWithGoogleAsync(request);
            SetTokenCookie(result.Token);
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

    [HttpPost("check-email")]
    public async Task<ActionResult<CheckEmailResponseDto>> CheckEmail([FromBody] CheckEmailRequestDto request)
    {
        try
        {
            var result = await _authBusiness.CheckEmailAsync(request);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var result = await _authBusiness.RegisterAsync(request);
            SetTokenCookie(result.Token);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var result = await _authBusiness.LoginWithPasswordAsync(request);
            SetTokenCookie(result.Token);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("dev-login")]
    public async Task<ActionResult<AuthResponseDto>> DevLogin([FromBody] DevLoginRequestDto request)
    {
        try
        {
            var result = await _authBusiness.DevLoginAsync(request);
            SetTokenCookie(result.Token);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    public ActionResult Logout()
    {
        Response.Cookies.Delete("accesorios_token", new CookieOptions
        {
            Path = "/",
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax
        });
        return Ok(new { message = "Sesión cerrada correctamente." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new { message = "No autenticado." });
        }

        try
        {
            await _authBusiness.ChangePasswordAsync(email, request);
            return Ok(new { message = "Contraseña actualizada exitosamente." });
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
