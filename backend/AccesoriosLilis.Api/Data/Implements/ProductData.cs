using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Model;
using Microsoft.EntityFrameworkCore;

namespace AccesoriosLilis.Api.Data.Implements;

public class ProductData : BaseData<Product>, IProductData
{
    public ProductData(ApplicationDbContext context)
        : base(context)
    {
    }

    public async Task<List<Product>> GetByCategoryAsync(string category)
    {
        return await _context.Products
            .Where(x => x.Category.ToLower() == category.ToLower())
            .ToListAsync();
    }
}
