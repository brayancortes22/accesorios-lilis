using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using AccesoriosLilis.Api.Utilities.Exceptions;
using AccesoriosLilis.Api.Utilities.Security;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;

namespace AccesoriosLilis.Api.Business.Implements;

public class AuthBusiness : IAuthBusiness
{
    private readonly IConfiguration _configuration;
    private readonly IJwtService _jwtService;
    private readonly ICaptchaService _captchaService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuthBusiness> _logger;

    public AuthBusiness(
        IConfiguration configuration,
        IJwtService jwtService,
        ICaptchaService captchaService,
        ApplicationDbContext context,
        ILogger<AuthBusiness> logger)
    {
        _configuration = configuration;
        _jwtService = jwtService;
        _captchaService = captchaService;
        _context = context;
        _logger = logger;
    }

    private bool IsInitialMasterAdminEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;

        var adminEmailsConfig = _configuration["AdminEmails"]
            ?? Environment.GetEnvironmentVariable("ADMIN_EMAILS")
            ?? "lombanaliliana64@gmail.com,bscl20062007@gmail.com,brayanstidcorteslombana@gmail.com,liliana.lombana@gmail.com,admin@accesorioslilis.com,liliana@accesorioslilis.com";

        var adminList = adminEmailsConfig
            .Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(e => e.Trim().ToLowerInvariant())
            .ToList();

        return adminList.Contains(email.Trim().ToLowerInvariant());
    }

    private static readonly HashSet<string> DisposableEmailDomains = new(StringComparer.OrdinalIgnoreCase)
    {
        "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
        "yopmail.com", "throwawaymail.com", "trashmail.com", "fake.com", "test.com",
        "example.com", "asdf.com", "sharklasers.com", "dispostable.com", "getairmail.com",
        "temp-mail.org", "fakeinbox.com", "maildrop.cc"
    };

    public async Task<AuthResponseDto> AuthenticateWithGoogleAsync(GoogleLoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            throw new BusinessException("El token de autenticación de Google es obligatorio.");
        }

        // 1. Validar Captcha si está habilitado
        var isCaptchaValid = await _captchaService.VerifyCaptchaAsync(request.CaptchaToken);
        if (!isCaptchaValid)
        {
            throw new BusinessException("La verificación de seguridad (Captcha) ha fallado. Por favor intenta de nuevo.");
        }

        string email = null;
        string fullName = null;
        string pictureUrl = null;

        // 2. Intentar validar como Google ID Token
        try
        {
            var googleClientId = _configuration["Google:ClientId"]
                ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");

            var settings = new GoogleJsonWebSignature.ValidationSettings();
            if (!string.IsNullOrWhiteSpace(googleClientId))
            {
                settings.Audience = new[] { googleClientId };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            email = payload.Email?.Trim().ToLowerInvariant();
            fullName = string.IsNullOrWhiteSpace(payload.Name) ? email : payload.Name.Trim();
            pictureUrl = payload.Picture;
        }
        catch (Exception idEx)
        {
            _logger.LogInformation("ID Token no coincidió directamente, probando verificación via Google UserInfo API: {Message}", idEx.Message);

            // 3. Intentar validar como Google OAuth Access Token via endpoint oficial de Google
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.IdToken);
                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
                
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    using var doc = System.Text.Json.JsonDocument.Parse(json);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("email", out var emailProp) && !string.IsNullOrWhiteSpace(emailProp.GetString()))
                    {
                        email = emailProp.GetString().Trim().ToLowerInvariant();
                        fullName = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : email;
                        pictureUrl = root.TryGetProperty("picture", out var picProp) ? picProp.GetString() : null;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar token con Google UserInfo");
            }
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new BusinessException("No fue posible validar tu cuenta con los servidores oficiales de Google. Asegúrate de haber seleccionado una cuenta válida.");
        }

        // 4. Buscar o crear usuario en MySQL
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user is not null)
        {
            user.LastLoginAt = DateTime.UtcNow;
            user.PictureUrl = pictureUrl ?? user.PictureUrl;
            user.FullName = fullName ?? user.FullName;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else
        {
            var role = IsInitialMasterAdminEmail(email) ? "Admin" : "Customer";
            user = new User
            {
                Email = email,
                FullName = fullName ?? email.Split('@')[0],
                Role = role,
                PictureUrl = pictureUrl ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                LastLoginAt = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        var userDto = new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            PictureUrl = user.PictureUrl
        };

        // 5. Generar JWT firmado con el rol verificado
        var token = _jwtService.GenerateToken(userDto);

        return new AuthResponseDto
        {
            Token = token,
            User = userDto
        };
    }

    public async Task<AuthResponseDto> LoginWithPasswordAsync(LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new BusinessException("El correo electrónico es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new BusinessException("La contraseña es obligatoria para proteger tu cuenta contra accesos no autorizados.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        // 1. Validar sintaxis de correo con Regex estricto
        var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", System.Text.RegularExpressions.RegexOptions.Compiled);
        if (!emailRegex.IsMatch(email))
        {
            throw new BusinessException("El formato del correo electrónico ingresado no es válido.");
        }

        var parts = email.Split('@');
        var mailbox = parts[0];
        var domain = parts[1];

        // 2. Bloquear correos basura o nombres falsos
        if (mailbox.Length < 3)
        {
            throw new BusinessException("El correo ingresado es demasiado corto o inválido.");
        }

        if (DisposableEmailDomains.Contains(domain))
        {
            throw new BusinessException($"El dominio @{domain} es temporal o inválido. Por favor usa un correo real de Google o proveedor confiable.");
        }

        var fullName = string.IsNullOrWhiteSpace(request.FullName) ? mailbox : request.FullName.Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user is not null)
        {
            // SI EL USUARIO YA TIENE CONTRASEÑA, VERIFICARLA ESTRICTAMENTE
            if (!string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                var isPasswordValid = PasswordHasher.VerifyPassword(request.Password, user.PasswordHash);
                if (!isPasswordValid)
                {
                    throw new BusinessException("Contraseña incorrecta. Por favor verifica tus credenciales para acceder a tu cuenta.");
                }
            }
            else
            {
                // Si la cuenta aún no tenía contraseña registrada, se establece en este primer inicio
                if (request.Password.Length < 6)
                {
                    throw new BusinessException("Para proteger tu cuenta, la contraseña debe tener al menos 6 caracteres.");
                }
                user.PasswordHash = PasswordHasher.HashPassword(request.Password);
            }

            user.LastLoginAt = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(fullName))
            {
                user.FullName = fullName;
            }
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else
        {
            // Registro de nueva cuenta con contraseña
            if (request.Password.Length < 6)
            {
                throw new BusinessException("Para proteger tu cuenta, la contraseña debe tener al menos 6 caracteres.");
            }

            var role = IsInitialMasterAdminEmail(email) ? "Admin" : "Customer";
            user = new User
            {
                Email = email,
                FullName = fullName,
                Role = role,
                PasswordHash = PasswordHasher.HashPassword(request.Password),
                PictureUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                LastLoginAt = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        var userDto = new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            PictureUrl = user.PictureUrl
        };

        var token = _jwtService.GenerateToken(userDto);

        return new AuthResponseDto
        {
            Token = token,
            User = userDto
        };
    }

    public async Task<CheckEmailResponseDto> CheckEmailAsync(CheckEmailRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new BusinessException("El correo electrónico es obligatorio.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", System.Text.RegularExpressions.RegexOptions.Compiled);
        if (!emailRegex.IsMatch(email))
        {
            throw new BusinessException("El formato del correo ingresado no es válido.");
        }

        var parts = email.Split('@');
        var mailbox = parts[0];
        var domain = parts[1];

        if (mailbox.Length < 3)
        {
            throw new BusinessException("El correo ingresado es demasiado corto o inválido.");
        }

        if (DisposableEmailDomains.Contains(domain))
        {
            throw new BusinessException($"El dominio @{domain} es temporal o inválido. Por favor usa un correo real.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user is not null)
        {
            return new CheckEmailResponseDto
            {
                Exists = true,
                Email = user.Email,
                FullName = user.FullName,
                HasPassword = !string.IsNullOrWhiteSpace(user.PasswordHash),
                Message = "Usuario registrado encontrado."
            };
        }

        return new CheckEmailResponseDto
        {
            Exists = false,
            Email = email,
            FullName = null,
            HasPassword = false,
            Message = "Correo nuevo no registrado."
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new BusinessException("El correo electrónico es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            throw new BusinessException("El nombre completo es obligatorio para tu registro.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            throw new BusinessException("La contraseña debe tener al menos 6 caracteres.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", System.Text.RegularExpressions.RegexOptions.Compiled);
        if (!emailRegex.IsMatch(email))
        {
            throw new BusinessException("El formato del correo ingresado no es válido.");
        }

        var parts = email.Split('@');
        var domain = parts[1];
        if (DisposableEmailDomains.Contains(domain))
        {
            throw new BusinessException($"El dominio @{domain} es temporal o inválido.");
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (existingUser is not null)
        {
            throw new BusinessException("Este correo ya se encuentra registrado. Por favor inicia sesión con tu contraseña.");
        }

        var role = IsInitialMasterAdminEmail(email) ? "Admin" : "Customer";
        var user = new User
        {
            Email = email,
            FullName = request.FullName.Trim(),
            Role = role,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            PictureUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            LastLoginAt = DateTime.UtcNow,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var userDto = new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            PictureUrl = user.PictureUrl
        };

        var token = _jwtService.GenerateToken(userDto);

        return new AuthResponseDto
        {
            Token = token,
            User = userDto
        };
    }

    public async Task<AuthResponseDto> DevLoginAsync(DevLoginRequestDto request)
    {
        return await LoginWithPasswordAsync(new LoginRequestDto
        {
            Email = request.Email,
            Password = request.Password ?? string.Empty,
            FullName = request.FullName
        });
    }

    public async Task<bool> ChangePasswordAsync(string email, ChangePasswordRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new BusinessException("Usuario no autenticado.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            throw new BusinessException("La nueva contraseña debe tener al menos 6 caracteres.");
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user is null)
        {
            throw new BusinessException("Usuario no encontrado.");
        }

        // Si ya tenía contraseña registrada, verificar la actual
        if (!string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || !PasswordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                throw new BusinessException("La contraseña actual es incorrecta.");
            }
        }

        user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserInfoDto> GetCurrentUserAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new BusinessException("Usuario no autenticado.");
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user is null)
        {
            return new UserInfoDto
            {
                Id = 0,
                Email = normalizedEmail,
                FullName = normalizedEmail.Split('@')[0],
                Role = "Customer"
            };
        }

        return new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            PictureUrl = user.PictureUrl
        };
    }
}
