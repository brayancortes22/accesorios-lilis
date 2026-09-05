namespace AccesoriosLilis.Api.Web.Middlewares;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            // 1. Prevenir MIME-sniffing
            headers.TryAdd("X-Content-Type-Options", "nosniff");

            // 2. Prevenir Clickjacking (no permitir incrustación en iframes de otros sitios)
            headers.TryAdd("X-Frame-Options", "DENY");

            // 3. Protección XSS en navegadores legados
            headers.TryAdd("X-XSS-Protection", "1; mode=block");

            // 4. Política de Referrer segura
            headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");

            // 5. Restricción de APIs peligrosas del navegador
            headers.TryAdd("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

            // 6. Eliminar cabeceras que delatan tecnología del servidor
            headers.Remove("Server");
            headers.Remove("X-Powered-By");
            headers.Remove("X-AspNet-Version");

            return Task.CompletedTask;
        });

        await _next(context);
    }
}
