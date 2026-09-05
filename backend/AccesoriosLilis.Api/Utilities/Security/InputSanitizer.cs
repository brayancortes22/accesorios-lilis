using System.Text.RegularExpressions;

namespace AccesoriosLilis.Api.Utilities.Security;

public static class InputSanitizer
{
    // Regex para detectar y remover bloques enteros de script (<script>...</script>), etiquetas HTML y patrones de inyección
    private static readonly Regex ScriptBlockRegex = new(@"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    private static readonly Regex HtmlTagsRegex = new(@"<[^>]+>", RegexOptions.Compiled);
    private static readonly Regex ScriptPatternRegex = new(@"(javascript:|vbscript:|onload=|onerror=|onclick=|eval\(|<script|<iframe|alert\()", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    /// <summary>
    /// Limpia un texto eliminando etiquetas HTML, inyecciones de scripts y espacios redundantes.
    /// </summary>
    public static string Sanitize(string? input, int maxLength = 1000)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var cleaned = input.Trim();

        // 1. Remover bloques completos de script (<script>...</script>)
        cleaned = ScriptBlockRegex.Replace(cleaned, string.Empty);

        // 2. Remover etiquetas HTML (<tag>, </tag>, etc.)
        cleaned = HtmlTagsRegex.Replace(cleaned, string.Empty);

        // 3. Remover patrones peligrosos de scripting residuales
        cleaned = ScriptPatternRegex.Replace(cleaned, string.Empty);

        // 4. Limitar longitud máxima de seguridad
        if (cleaned.Length > maxLength)
        {
            cleaned = cleaned[..maxLength];
        }

        return cleaned.Trim();
    }

    /// <summary>
    /// Verifica si un texto contiene patrones sospechosos de inyección o scripts.
    /// </summary>
    public static bool HasDangerousPatterns(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return false;
        return ScriptPatternRegex.IsMatch(input);
    }
}
