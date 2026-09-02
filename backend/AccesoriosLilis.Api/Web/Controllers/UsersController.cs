using System.Security.Claims;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccesoriosLilis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("admins")]
    public async Task<ActionResult<List<UserInfoDto>>> GetAdmins()
    {
        var admins = await _context.Users
            .Where(u => u.Role == "Admin" && u.IsActive)
            .OrderBy(u => u.FullName)
            .Select(u => new UserInfoDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                PictureUrl = u.PictureUrl
            })
            .ToListAsync();

        return Ok(admins);
    }

    [HttpPost("admins")]
    public async Task<ActionResult<UserInfoDto>> AddAdmin([FromBody] CreateAdminUserRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            return BadRequest(new { message = "Por favor ingresa un correo electrónico válido." });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user is not null)
        {
            user.Role = "Admin";
            user.IsActive = true;
            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName.Trim();
            }
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else
        {
            var fullName = !string.IsNullOrWhiteSpace(request.FullName)
                ? request.FullName.Trim()
                : normalizedEmail.Split('@')[0];

            user = new User
            {
                Email = normalizedEmail,
                FullName = fullName,
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        return Ok(new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            PictureUrl = user.PictureUrl
        });
    }

    private static readonly HashSet<string> ProtectedMasterEmails = new(StringComparer.OrdinalIgnoreCase)
    {
        "lombanaliliana64@gmail.com",
        "brayanstidcorteslombana@gmail.com",
        "bscl20062007@gmail.com",
        "liliana.lombana@gmail.com",
        "admin@accesorioslilis.com"
    };

    [HttpDelete("admins/{id:int}")]
    public async Task<ActionResult> RevokeAdmin(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(currentUserId, out var parsedId) && parsedId == id)
        {
            return BadRequest(new { message = "No puedes revocar tus propios permisos de administrador." });
        }

        var user = await _context.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound(new { message = "Usuario no encontrado." });
        }

        if (ProtectedMasterEmails.Contains(user.Email))
        {
            return BadRequest(new { message = "Esta cuenta es una cuenta principal de propietario/desarrollador y está protegida contra eliminación." });
        }

        // Revocar rol a cliente
        user.Role = "Customer";
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Permisos de administrador revocados para {user.Email}." });
    }
}
