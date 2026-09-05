using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccesoriosLilis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductBusiness _productBusiness;
    private readonly ApplicationDbContext _context;

    public ProductsController(IProductBusiness productBusiness, ApplicationDbContext context)
    {
        _productBusiness = productBusiness;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetAll([FromQuery] string? category = null, [FromQuery] bool includeInactive = false)
    {
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("todos", StringComparison.OrdinalIgnoreCase))
        {
            var byCat = await _productBusiness.GetByCategoryAsync(category);
            return Ok(includeInactive ? byCat : byCat.Where(p => p.IsActive && p.DeletedAt == null).ToList());
        }

        var all = await _productBusiness.GetAllAsync();
        return Ok(includeInactive ? all : all.Where(p => p.IsActive && p.DeletedAt == null).ToList());
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/toggle-active")]
    public async Task<ActionResult<Product>> ToggleActive(int id)
    {
        var product = await _productBusiness.GetByIdAsync(id);
        if (product is null)
        {
            return NotFound(new { message = "Producto no encontrado." });
        }

        var dto = new ProductDto
        {
            Name = product.Name,
            Category = product.Category,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            Description = product.Description,
            IsActive = !product.IsActive
        };

        var updated = await _productBusiness.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _productBusiness.GetByIdAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<List<Product>>> GetByCategory(string category)
    {
        return Ok(await _productBusiness.GetByCategoryAsync(category));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> Create([FromBody] ProductDto request)
    {
        try
        {
            var created = await _productBusiness.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> Update(int id, [FromBody] ProductDto request)
    {
        var updated = await _productBusiness.UpdateAsync(id, request);
        if (updated is null)
        {
            return NotFound();
        }

        return Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var product = await _productBusiness.GetByIdAsync(id);
        if (product is null)
        {
            return NotFound(new { message = "Producto no encontrado." });
        }

        // 1. Verificar si el producto tiene órdenes o pedidos asociados en el historial
        var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrders)
        {
            // Tiene historial de ventas: No se borra físicamente para proteger la contabilidad.
            // Se desactiva y se oculta de la tienda (Soft delete)
            var soft = await _productBusiness.SoftDeleteAsync(id);
            return Ok(new
            {
                message = $"El accesorio '{product.Name}' tiene pedidos asociados en el historial. Se ha desactivado y retirado de la tienda para proteger tus registros.",
                mode = "deactivated",
                id = id,
                product = soft
            });
        }
        else
        {
            // Creado por error (sin pedidos): Borrado físico permanente de la base de datos
            var hardDeleted = await _productBusiness.HardDeleteAsync(id);
            if (!hardDeleted)
            {
                return NotFound(new { message = "No se pudo eliminar el producto." });
            }

            return Ok(new
            {
                message = $"El accesorio '{product.Name}' fue eliminado definitivamente de la base de datos.",
                mode = "deleted",
                id = id
            });
        }
    }
}
