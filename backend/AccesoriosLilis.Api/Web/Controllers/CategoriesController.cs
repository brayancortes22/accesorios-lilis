using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccesoriosLilis.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryBusiness _categoryBusiness;

    public CategoriesController(ICategoryBusiness categoryBusiness)
    {
        _categoryBusiness = categoryBusiness;
    }

    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
    {
        return Ok(await _categoryBusiness.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetById(int id)
    {
        var category = await _categoryBusiness.GetByIdAsync(id);
        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Category>> Create([FromBody] CategoryDto request)
    {
        try
        {
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
        try
        {
            var updated = await _categoryBusiness.UpdateAsync(id, request);
            if (updated is null)
            {
                return NotFound();
            }

            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<Category>> SoftDelete(int id)
    {
        var deleted = await _categoryBusiness.SoftDeleteAsync(id);
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
        var deleted = await _categoryBusiness.HardDeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
