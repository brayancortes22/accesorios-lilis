using AccesoriosLilis.Api.Business;
using AccesoriosLilis.Api.Models;
using AccesoriosLilis.Api.Models.Dtos;
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
    public async Task<ActionResult<List<Product>>> GetAll()
    {
        return Ok(await _productBusiness.GetAllAsync());
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

    [HttpPost]
    public async Task<ActionResult<Product>> Create([FromBody] CreateProductRequest request)
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

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> Update(int id, [FromBody] CreateProductRequest request)
    {
        var updated = await _productBusiness.UpdateAsync(id, request);
        if (updated is null)
        {
            return NotFound();
        }

        return Ok(updated);
    }

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
