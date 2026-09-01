using AccesoriosLilis.Api.Models;
using AccesoriosLilis.Api.Models.Dtos;

namespace AccesoriosLilis.Api.Business;

public interface IProductBusiness
{
    Task<List<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<Product> CreateAsync(CreateProductRequest request);
    Task<Product?> UpdateAsync(int id, CreateProductRequest request);
    Task<Product?> SoftDeleteAsync(int id);
    Task<bool> HardDeleteAsync(int id);
}
