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
        IQueryable<Product> query = _context.Products.AsNoTracking();

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive && p.DeletedAt == null);
        }

        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("todos", StringComparison.OrdinalIgnoreCase))
        {
            var catLower = category.ToLower();
            query = query.Where(p => p.Category.ToLower() == catLower);
        }

        var products = await query.ToListAsync();

        if (includeInactive)
        {
            var orderedProductIds = await _context.OrderItems
                .Select(oi => oi.ProductId)
                .Distinct()
                .ToListAsync();
            var orderedSet = new HashSet<int>(orderedProductIds);

            foreach (var prod in products)
            {
                prod.HasOrders = orderedSet.Contains(prod.Id);
            }
        }

        return Ok(products);
    }

    [HttpGet("sold-gallery")]
    public async Task<ActionResult> GetSoldGallery()
    {
        var soldItems = await _context.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.Product)
            .Where(oi => oi.Product != null && oi.Order != null && oi.Order.Status != "Cancelado")
            .ToListAsync();

        var groupedByProduct = soldItems
            .GroupBy(oi => oi.ProductId)
            .ToList();

        var result = new List<object>();

        foreach (var group in groupedByProduct)
        {
            var product = group.First().Product!;
            // Si el producto aún tiene stock físico disponible para entrega inmediata, no se exhibe en la galería de vendidos
            if (product.Stock > 0 && product.IsActive && product.DeletedAt == null)
            {
                continue;
            }

            var activeOrders = group
                .Select(oi => oi.Order!)
                .OrderByDescending(o => o.CreatedAt)
                .ToList();

            var latestOrder = activeOrders.FirstOrDefault();
            var latestStatus = latestOrder?.Status ?? "Completado";

            string soldStatusKey;
            string soldStatusLabel;

            if (latestStatus.Equals("Por Encargo", StringComparison.OrdinalIgnoreCase) ||
                latestStatus.Equals("En Elaboración", StringComparison.OrdinalIgnoreCase) ||
                latestStatus.Equals("Empacando", StringComparison.OrdinalIgnoreCase))
            {
                soldStatusKey = "elaboracion";
                soldStatusLabel = "🧶 En Elaboración / Empacando";
            }
            else if (latestStatus.Equals("Enviado", StringComparison.OrdinalIgnoreCase))
            {
                soldStatusKey = "enviado";
                soldStatusLabel = "🚚 Enviado / En Camino";
            }
            else
            {
                soldStatusKey = "entregado";
                soldStatusLabel = "✅ Vendido y Entregado";
            }

            result.Add(new
            {
                id = product.Id,
                sku = $"ART-{product.Id:D3}",
                name = product.Name,
                category = product.Category,
                price = product.Price,
                imageUrl = product.ImageUrl,
                description = product.Description,
                isActive = false,
                soldStatus = soldStatusKey,
                soldStatusLabel = soldStatusLabel,
                totalOrdersCount = group.Sum(x => x.Quantity),
                lastSoldAt = latestOrder?.CreatedAt
            });
        }

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/toggle-active")]
    public async Task<ActionResult<Product>> ToggleActive(int id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return NotFound(new { message = "Producto no encontrado." });
        }

        var targetActive = !product.IsActive;
        product.IsActive = targetActive;
        if (targetActive)
        {
            product.DeletedAt = null;
            if (product.Stock <= 0)
            {
                product.Stock = 5;
            }
        }
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        product.HasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);

        return Ok(product);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/reactivate")]
    public async Task<ActionResult> Reactivate(int id, [FromQuery] int? stock = null)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return NotFound(new { message = "Producto no encontrado." });
        }

        product.IsActive = true;
        product.DeletedAt = null;
        if (stock.HasValue && stock.Value > 0)
        {
            product.Stock = stock.Value;
        }
        else if (product.Stock <= 0)
        {
            product.Stock = 5;
        }
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        product.HasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);

        return Ok(new
        {
            message = $"¡El accesorio '{product.Name}' ha sido reactivado exitosamente y ya está visible nuevamente en la tienda para tus clientes!",
            product
        });
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
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
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
            product.IsActive = false;
            product.DeletedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            product.HasOrders = true;

            return Ok(new
            {
                message = $"El accesorio '{product.Name}' tiene pedidos asociados en el historial. Se ha desactivado y archivado fuera de la tienda para proteger tus registros contables. Podrás reactivarlo cuando desees.",
                mode = "deactivated",
                id = id,
                product
            });
        }
        else
        {
            // Creado por error (sin pedidos): Borrado físico permanente de la base de datos
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"El accesorio '{product.Name}' fue eliminado definitivamente de la base de datos.",
                mode = "deleted",
                id = id
            });
        }
    }
}
