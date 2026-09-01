using AccesoriosLilis.Api.Models;

namespace AccesoriosLilis.Api.Data;

public class ProductData : IProductData
{
    private readonly List<Product> _products = new()
    {
        new Product
        {
            Id = 1,
            Name = "Aretes de flor",
            Category = "aretes",
            Price = 38000m,
            Stock = 12,
            ImageUrl = "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
            Description = "Aretes delicados para looks casuales y elegantes.",
            IsActive = true
        },
        new Product
        {
            Id = 2,
            Name = "Collar rosa floral",
            Category = "collares",
            Price = 42000m,
            Stock = 8,
            ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
            Description = "Collar romántico para complementar cualquier outfit.",
            IsActive = true
        }
    };

    public Task<List<Product>> GetAllAsync() => Task.FromResult(_products.Where(p => p.IsActive).ToList());

    public Task<Product?> GetByIdAsync(int id) => Task.FromResult(_products.FirstOrDefault(p => p.Id == id && p.IsActive));

    public Task<Product> CreateAsync(Product product)
    {
        var nextId = _products.Count == 0 ? 1 : _products.Max(p => p.Id) + 1;
        product.Id = nextId;
        product.CreatedAt = DateTime.UtcNow;
        product.IsActive = true;
        _products.Add(product);
        return Task.FromResult(product);
    }

    public Task<Product?> UpdateAsync(int id, Product product)
    {
        var current = _products.FirstOrDefault(p => p.Id == id && p.IsActive);
        if (current is null)
        {
            return Task.FromResult<Product?>(null);
        }

        current.Name = product.Name;
        current.Category = product.Category;
        current.Price = product.Price;
        current.Stock = product.Stock;
        current.ImageUrl = product.ImageUrl;
        current.Description = product.Description;
        current.IsActive = product.IsActive;

        return Task.FromResult<Product?>(current);
    }

    public Task<Product?> SoftDeleteAsync(int id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id && p.IsActive);
        if (product is null)
        {
            return Task.FromResult<Product?>(null);
        }

        product.IsActive = false;
        product.DeletedAt = DateTime.UtcNow;
        return Task.FromResult<Product?>(product);
    }

    public Task<bool> HardDeleteAsync(int id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product is null)
        {
            return Task.FromResult(false);
        }

        _products.Remove(product);
        return Task.FromResult(true);
    }
}
