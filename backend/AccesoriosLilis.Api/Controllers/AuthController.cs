using Microsoft.AspNetCore.Mvc;

namespace AccesoriosLilis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
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
