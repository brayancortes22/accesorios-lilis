namespace AccesoriosLilis.Api.Utilities.Security;

public interface ICaptchaService
{
    Task<bool> VerifyCaptchaAsync(string? captchaToken);
}
