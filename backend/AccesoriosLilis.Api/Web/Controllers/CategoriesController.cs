using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccesoriosLilis.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryBusiness _categoryBusiness;
    private readonly ApplicationDbContext _context;

    public CategoriesController(ICategoryBusiness categoryBusiness, ApplicationDbContext context)
    {
        _categoryBusiness = categoryBusiness;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll([FromQuery] bool includeInactive = false)
    {
        IQueryable<Category> query = _context.Categories.AsNoTracking();

        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive && c.DeletedAt == null);
        }

        var categories = await query.ToListAsync();

        // Calcular cantidad de productos asociados para cada categoría
        var allProductCategories = await _context.Products
            .AsNoTracking()
            .Select(p => p.Category.ToLower())
            .ToListAsync();

        foreach (var cat in categories)
        {
            var catNameLower = cat.Name.Trim().ToLower();
            cat.ProductCount = allProductCategories.Count(pCat =>
                pCat == catNameLower ||
                pCat.Contains(catNameLower) ||
                catNameLower.Contains(pCat)
            );
            cat.HasProducts = cat.ProductCount > 0;
        }

        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetById(int id)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
        {
            return NotFound(new { message = "Categoría no encontrada." });
        }

        var catNameLower = category.Name.Trim().ToLower();
        category.ProductCount = await _context.Products.CountAsync(p =>
            p.Category.ToLower() == catNameLower ||
            p.Category.ToLower().Contains(catNameLower) ||
            catNameLower.Contains(p.Category.ToLower())
        );
        category.HasProducts = category.ProductCount > 0;

        return Ok(category);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Category>> Create([FromBody] CategoryDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "El nombre de la categoría es obligatorio." });
            }

            var created = await _categoryBusiness.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Category>> Update(int id, [FromBody] CategoryDto request)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
        {
            return NotFound(new { message = "Categoría no encontrada." });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "El nombre de la categoría es obligatorio." });
        }

        var oldName = category.Name;
        category.Name = request.Name.Trim();
        category.Description = request.Description?.Trim();
        category.UpdatedAt = DateTime.UtcNow;

        // Si el nombre cambió, actualizamos la categoría en los productos existentes para que no queden huérfanos
        if (!string.Equals(oldName, category.Name, StringComparison.OrdinalIgnoreCase))
        {
            var oldNameLower = oldName.Trim().ToLower();
            var productsToUpdate = await _context.Products
                .Where(p => p.Category.ToLower() == oldNameLower || p.Category.ToLower().Contains(oldNameLower))
                .ToListAsync();

            foreach (var prod in productsToUpdate)
            {
                prod.Category = category.Name.ToLower();
                prod.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        var catNameLower = category.Name.Trim().ToLower();
        category.ProductCount = await _context.Products.CountAsync(p =>
            p.Category.ToLower() == catNameLower ||
            p.Category.ToLower().Contains(catNameLower) ||
            catNameLower.Contains(p.Category.ToLower())
        );
        category.HasProducts = category.ProductCount > 0;

        return Ok(category);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/reactivate")]
    public async Task<ActionResult> Reactivate(int id)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
        {
            return NotFound(new { message = "Categoría no encontrada." });
        }

        category.IsActive = true;
        category.DeletedAt = null;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var catNameLower = category.Name.Trim().ToLower();
        category.ProductCount = await _context.Products.CountAsync(p =>
            p.Category.ToLower() == catNameLower ||
            p.Category.ToLower().Contains(catNameLower) ||
            catNameLower.Contains(p.Category.ToLower())
        );
        category.HasProducts = category.ProductCount > 0;

        return Ok(new
        {
            message = $"¡La categoría '{category.Name}' ha sido reactivada exitosamente y ya está visible nuevamente en la tienda!",
            category
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, [FromQuery] bool hard = false)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
        {
            return NotFound(new { message = "Categoría no encontrada." });
        }

        var catNameLower = category.Name.Trim().ToLower();
        var productCount = await _context.Products.CountAsync(p =>
            p.Category.ToLower() == catNameLower ||
            p.Category.ToLower().Contains(catNameLower) ||
            catNameLower.Contains(p.Category.ToLower())
        );

        if (productCount > 0 && !hard)
        {
            // Tiene productos asociados: No se borra físicamente para proteger el catálogo.
            // Se desactiva y archiva (Soft delete)
            category.IsActive = false;
            category.DeletedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            category.ProductCount = productCount;
            category.HasProducts = true;

            return Ok(new
            {
                message = $"La categoría '{category.Name}' tiene {productCount} producto(s) en el catálogo. Se ha archivado y desactivado fuera de la tienda pública para proteger tus productos. Podrás reactivarla cuando desees desde la pestaña 'Archivadas'.",
                mode = "deactivated",
                id = id,
                category
            });
        }
        else
        {
            // Sin productos asociados (o eliminación física forzada): Borrado definitivo de MySQL
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"La categoría '{category.Name}' fue eliminada definitivamente de la base de datos.",
                mode = "deleted",
                id = id
            });
        }
    }
}
