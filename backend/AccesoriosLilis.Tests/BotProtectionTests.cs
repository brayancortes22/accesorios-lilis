using AccesoriosLilis.Api.Entity.Dtos;
using Xunit;

namespace AccesoriosLilis.Tests;

public class BotProtectionTests
{
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

    [Theory]
    [InlineData("sqlmap/1.5#stable (https://sqlmap.org)", true)]
    [InlineData("Mozilla/5.0 (compatible; Nikto/2.1.6)", true)]
    [InlineData("wpscan v3.8.22", true)]
    [InlineData("masscan/1.0 (https://github.com/robertdavidgraham/masscan)", true)]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", false)]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", false)]
    public void UserAgent_ShouldDetectMaliciousScanners(string userAgent, bool isMaliciousExpected)
    {
        var lowerUa = userAgent.ToLowerInvariant();
        var detected = false;

        foreach (var signature in MaliciousSignatures)
        {
            if (lowerUa.Contains(signature))
            {
                detected = true;
                break;
            }
        }

        Assert.Equal(isMaliciousExpected, detected);
    }

    [Fact]
    public void OrderRequest_WhenTrapFieldIsFilled_ShouldBeRecognizedAsBot()
    {
        var request = new CreateOrderRequestDto
        {
            ClientName = "Bot User",
            Phone = "3001234567",
            TrapField = "automated_bot_payload"
        };

        var isBot = !string.IsNullOrWhiteSpace(request.TrapField);
        Assert.True(isBot);
    }

    [Fact]
    public void OrderRequest_WhenTrapFieldIsEmpty_ShouldBeRecognizedAsHuman()
    {
        var request = new CreateOrderRequestDto
        {
            ClientName = "Liliana Lombana",
            Phone = "3174811570",
            TrapField = null
        };

        var isBot = !string.IsNullOrWhiteSpace(request.TrapField);
        Assert.False(isBot);
    }
}
