using System.Text.Json;

namespace AccesoriosLilis.Api.Utilities.Security;

public class CaptchaService : ICaptchaService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<CaptchaService> _logger;

    public CaptchaService(IConfiguration configuration, ILogger<CaptchaService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = new HttpClient();
    }

    public async Task<bool> VerifyCaptchaAsync(string? captchaToken)
    {
        var secretKey = _configuration["Captcha:SecretKey"]
            ?? Environment.GetEnvironmentVariable("CAPTCHA_SECRET_KEY");

        // Si no está configurada la llave secreta (desarrollo local), permitimos el paso seguro.
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(captchaToken))
        {
            _logger.LogWarning("Verificación de Captcha fallida: token vacío.");
            return false;
        }

        try
        {
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "secret", secretKey },
                { "response", captchaToken }
            });

            // Endpoint genérico compatible con Google reCAPTCHA / Cloudflare Turnstile
            var verifyUrl = _configuration["Captcha:VerifyUrl"] ?? "https://www.google.com/recaptcha/api/siteverify";
            var response = await _httpClient.PostAsync(verifyUrl, content);
            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("success", out var successElement))
            {
                return successElement.GetBoolean();
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al conectar con el servicio de verificación de Captcha.");
            return true; // Falla segura en desarrollo
        }
    }
}
