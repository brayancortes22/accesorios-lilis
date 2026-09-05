using System.Net;
using System.Text.Json;
using AccesoriosLilis.Api.Utilities.Exceptions;

namespace AccesoriosLilis.Api.Web.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        string userMessage;

        if (ex is BusinessException businessEx)
        {
            statusCode = HttpStatusCode.BadRequest;
            userMessage = businessEx.Message;
            _logger.LogWarning("Business warning en {Path}: {Message}", context.Request.Path, businessEx.Message);
        }
        else if (ex is ArgumentException argEx)
        {
            statusCode = HttpStatusCode.BadRequest;
            userMessage = argEx.Message;
            _logger.LogWarning("Argument validation error en {Path}: {Message}", context.Request.Path, argEx.Message);
        }
        else if (ex is KeyNotFoundException keyEx)
        {
            statusCode = HttpStatusCode.NotFound;
            userMessage = keyEx.Message;
        }
        else
        {
            // Error inesperado del servidor o base de datos (MySql, NRE, etc.)
            // Registro seguro en logs internos SIN exponer trazas al cliente
            _logger.LogError(ex, "Excepción no controlada en endpoint {Method} {Path}", context.Request.Method, context.Request.Path);
            userMessage = "Ha ocurrido un error inesperado al procesar la solicitud. El equipo técnico ha sido notificado.";
        }

        if (!context.Response.HasStarted)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var responsePayload = new
            {
                message = userMessage,
                status = (int)statusCode
            };

            var json = JsonSerializer.Serialize(responsePayload);
            await context.Response.WriteAsync(json);
        }
    }
}
