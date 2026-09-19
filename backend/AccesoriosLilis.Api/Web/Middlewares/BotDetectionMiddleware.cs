using System.Net;
using System.Text.Json;

namespace AccesoriosLilis.Api.Web.Middlewares;

public class BotDetectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<BotDetectionMiddleware> _logger;

    private static readonly string[] MaliciousSignatures =
    [
        "sqlmap",
        "nikto",
        "masscan",
        "wpscan",
        "acunetix",
        "havij",
        "zgrab",
        "dirbuster",
        "gobuster",
        "nmap"
    ];

    public BotDetectionMiddleware(RequestDelegate next, ILogger<BotDetectionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        var method = context.Request.Method.ToUpperInvariant();

        // Solo evaluar rutas de API críticas en operaciones de escritura / mutación
        if (path.StartsWith("/api/") && (method is "POST" or "PUT" or "PATCH" or "DELETE"))
        {
            var userAgent = context.Request.Headers.UserAgent.ToString().Trim();

            // 1. Detectar ausencia total de User-Agent en peticiones que intentan alterar datos
            if (string.IsNullOrWhiteSpace(userAgent) || userAgent.Length < 3)
            {
                _logger.LogWarning("Bloqueo de bot: Petición {Method} {Path} sin User-Agent desde IP {Ip}",
                    method, path, context.Connection.RemoteIpAddress);

                await RejectAsync(context, "Acceso denegado: Cabecera User-Agent obligatoria ausente o inválida.");
                return;
            }

            // 2. Detectar herramientas de escaneo y hacking automatizado conocidas
            var lowerUa = userAgent.ToLowerInvariant();
            foreach (var signature in MaliciousSignatures)
            {
                if (lowerUa.Contains(signature))
                {
                    _logger.LogWarning("Bloqueo de bot/scanner malicioso [{Signature}] en {Path} desde IP {Ip}",
                        signature, path, context.Connection.RemoteIpAddress);

                    await RejectAsync(context, "Acceso denegado por actividad automatizada maliciosa.");
                    return;
                }
            }
        }

        await _next(context);
    }

    private static async Task RejectAsync(HttpContext context, string message)
    {
        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
        context.Response.ContentType = "application/json";

        var payload = JsonSerializer.Serialize(new
        {
            message,
            status = 403,
            timestamp = DateTime.UtcNow
        });

        await context.Response.WriteAsync(payload);
    }
}
