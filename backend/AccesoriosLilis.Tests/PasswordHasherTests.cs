using AccesoriosLilis.Api.Utilities.Security;
using Xunit;

namespace AccesoriosLilis.Tests;

public class PasswordHasherTests
{
    [Fact]
    public void HashPassword_ShouldGenerateSaltAndHash()
    {
        // Arrange
        var password = "SuperSecretPassword123*";

        // Act
        var hash = PasswordHasher.HashPassword(password);

        // Assert
        Assert.NotNull(hash);
        Assert.Contains(":", hash);
        var parts = hash.Split(':');
        Assert.Equal(2, parts.Length);
        Assert.NotEmpty(parts[0]);
        Assert.NotEmpty(parts[1]);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnTrueForCorrectPassword()
    {
        // Arrange
        var password = "CorrectPassword2026!";
        var hash = PasswordHasher.HashPassword(password);

        // Act
        var isValid = PasswordHasher.VerifyPassword(password, hash);

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalseForWrongPassword()
    {
        // Arrange
        var password = "CorrectPassword2026!";
        var hash = PasswordHasher.HashPassword(password);

        // Act
        var isValid = PasswordHasher.VerifyPassword("WrongPassword", hash);

        // Assert
        Assert.False(isValid);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalseForInvalidHashFormat()
    {
        // Arrange & Act
        var result1 = PasswordHasher.VerifyPassword("password", null);
        var result2 = PasswordHasher.VerifyPassword("password", "invalid_no_colon");
        var result3 = PasswordHasher.VerifyPassword("", "salt:hash");

        // Assert
        Assert.False(result1);
        Assert.False(result2);
        Assert.False(result3);
    }
}
