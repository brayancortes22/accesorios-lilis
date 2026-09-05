using AccesoriosLilis.Api.Utilities.Security;
using Xunit;

namespace AccesoriosLilis.Tests;

public class InputSanitizerTests
{
    [Fact]
    public void Sanitize_ShouldRemoveScriptTags()
    {
        // Arrange
        var dangerousInput = "<script>alert('xss')</script>Juan Perez";

        // Act
        var result = InputSanitizer.Sanitize(dangerousInput);

        // Assert
        Assert.DoesNotContain("<script>", result);
        Assert.DoesNotContain("</script>", result);
        Assert.DoesNotContain("alert", result);
        Assert.Contains("Juan Perez", result);
    }

    [Fact]
    public void Sanitize_ShouldRemoveHtmlTagsAndIframes()
    {
        // Arrange
        var dangerousInput = "<b>Hola</b> <iframe src='http://evil.com'></iframe>Mundo";

        // Act
        var result = InputSanitizer.Sanitize(dangerousInput);

        // Assert
        Assert.DoesNotContain("<b>", result);
        Assert.DoesNotContain("</b>", result);
        Assert.DoesNotContain("iframe", result);
        Assert.Equal("Hola Mundo", result);
    }

    [Fact]
    public void Sanitize_ShouldRespectMaxLength()
    {
        // Arrange
        var longInput = new string('A', 500);

        // Act
        var result = InputSanitizer.Sanitize(longInput, maxLength: 50);

        // Assert
        Assert.Equal(50, result.Length);
    }

    [Theory]
    [InlineData("<script>test</script>", true)]
    [InlineData("javascript:evil()", true)]
    [InlineData("onload=alert(1)", true)]
    [InlineData("Texto normal y seguro", false)]
    public void HasDangerousPatterns_ShouldDetectThreats(string input, bool expected)
    {
        // Act
        var hasPattern = InputSanitizer.HasDangerousPatterns(input);

        // Assert
        Assert.Equal(expected, hasPattern);
    }
}
