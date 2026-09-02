using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.EntityFrameworkCore;

namespace AccesoriosLilis.Api.Data.Implements;

public class OrderData : BaseData<Order>, IOrderData
{
    public OrderData(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<List<Order>> GetOrdersWithDetailsAsync()
    {
        return await _context.Orders
            .Include(x => x.Customer)
            .Include(x => x.Items)
                .ThenInclude(i => i.Product)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderWithDetailsByIdAsync(int id)
    {
        return await _context.Orders
            .Include(x => x.Customer)
            .Include(x => x.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Customer> GetOrCreateCustomerAsync(string name, string phone, string? city, string? notes)
    {
        var existing = await _context.Customers
            .FirstOrDefaultAsync(c => c.Phone == phone);

        if (existing is not null)
        {
            if (!string.IsNullOrWhiteSpace(name)) existing.FullName = name;
            if (!string.IsNullOrWhiteSpace(city)) existing.City = city;
            if (!string.IsNullOrWhiteSpace(notes)) existing.Notes = notes;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        var newCustomer = new Customer
        {
            FullName = name,
            Phone = phone,
            City = city ?? "Algeciras",
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Customers.AddAsync(newCustomer);
        await _context.SaveChangesAsync();
        return newCustomer;
    }

    public async Task<bool> UpdateStatusAsync(int orderId, string status)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order is null) return false;

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
