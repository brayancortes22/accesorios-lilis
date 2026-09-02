using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccesoriosLilis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductBusiness _productBusiness;

    public ProductsController(IProductBusiness productBusiness)
    {
        _productBusiness = productBusiness;
    }

    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetAll([FromQuery] string? category = null, [FromQuery] bool includeInactive = true)
    {
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("todos", StringComparison.OrdinalIgnoreCase))
        {
            var byCat = await _productBusiness.GetByCategoryAsync(category);
            return Ok(includeInactive ? byCat : byCat.Where(p => p.IsActive).ToList());
        }

        var all = await _productBusiness.GetAllAsync();
        return Ok(includeInactive ? all : all.Where(p => p.IsActive).ToList());
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
    public async Task<ActionResult<Product>> SoftDelete(int id)
    {
        var deleted = await _productBusiness.SoftDeleteAsync(id);
        if (deleted is null)
        {
            return NotFound();
        }

        return Ok(deleted);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}/hard")]
    public async Task<ActionResult> HardDelete(int id)
    {
        var deleted = await _productBusiness.HardDeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
