using System.Text.RegularExpressions;

namespace AccesoriosLilis.Api.Utilities.Security;

public static class InputSanitizer
{
    // Regex para detectar y remover etiquetas HTML/XML y bloques de script/estilo
    private static readonly Regex HtmlTagsRegex = new(@"<[^>]+>", RegexOptions.Compiled);
    private static readonly Regex ScriptPatternRegex = new(@"(javascript:|vbscript:|onload=|onerror=|onclick=|eval\(|<script|<iframe)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

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

        // 1. Remover etiquetas HTML (<tag>, </tag>, etc.)
        cleaned = HtmlTagsRegex.Replace(cleaned, string.Empty);

        // 2. Remover patrones peligrosos de scripting
        cleaned = ScriptPatternRegex.Replace(cleaned, string.Empty);

        // 3. Limitar longitud máxima de seguridad
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
