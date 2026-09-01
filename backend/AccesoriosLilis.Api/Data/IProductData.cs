using AccesoriosLilis.Api.Models;

namespace AccesoriosLilis.Api.Data;

public interface IProductData
{
    Task<List<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<Product> CreateAsync(Product product);
    Task<Product?> UpdateAsync(int id, Product product);
    Task<Product?> SoftDeleteAsync(int id);
    Task<bool> HardDeleteAsync(int id);
}
