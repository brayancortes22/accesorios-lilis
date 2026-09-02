using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccesoriosLilis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderBusiness _orderBusiness;

    public OrdersController(IOrderBusiness orderBusiness)
    {
        _orderBusiness = orderBusiness;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<List<Order>>> GetAll()
    {
        return Ok(await _orderBusiness.GetOrdersWithDetailsAsync());
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Order>> GetById(int id)
    {
        var order = await _orderBusiness.GetOrderWithDetailsByIdAsync(id);
        if (order is null)
        {
            return NotFound(new { message = $"Pedido con ID {id} no encontrado." });
        }

        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> Create([FromBody] CreateOrderRequestDto request)
    {
        try
        {
            var result = await _orderBusiness.CreateOrderFromStoreAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Order.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno procesando el pedido.", details = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto request)
    {
        try
        {
            var updated = await _orderBusiness.UpdateStatusAsync(id, request.Status);
            if (!updated)
            {
                return NotFound(new { message = $"Pedido con ID {id} no encontrado." });
            }

            return Ok(new { message = $"Estado actualizado a {request.Status}." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}
