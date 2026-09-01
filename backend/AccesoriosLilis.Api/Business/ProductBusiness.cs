using AccesoriosLilis.Api.Data;
using AccesoriosLilis.Api.Models;
using AccesoriosLilis.Api.Models.Dtos;

namespace AccesoriosLilis.Api.Business;

public class ProductBusiness : IProductBusiness
{
    private readonly IProductData _productData;

    public ProductBusiness(IProductData productData)
    {
        _productData = productData;
    }

    public Task<List<Product>> GetAllAsync() => _productData.GetAllAsync();

    public Task<Product?> GetByIdAsync(int id) => _productData.GetByIdAsync(id);

    public async Task<Product> CreateAsync(CreateProductRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("El nombre del producto es requerido.");
        }

        var product = new Product
        {
            Name = request.Name,
            Category = request.Category,
            Price = request.Price,
            Stock = request.Stock,
            ImageUrl = request.ImageUrl,
            Description = request.Description,
            IsActive = request.IsActive
        };

        return await _productData.CreateAsync(product);
    }

    public async Task<Product?> UpdateAsync(int id, CreateProductRequest request)
    {
        var current = await _productData.GetByIdAsync(id);
        if (current is null)
        {
            return null;
        }

        current.Name = request.Name;
        current.Category = request.Category;
        current.Price = request.Price;
        current.Stock = request.Stock;
        current.ImageUrl = request.ImageUrl;
        current.Description = request.Description;
        current.IsActive = request.IsActive;

        return await _productData.UpdateAsync(id, current);
    }

    public Task<Product?> SoftDeleteAsync(int id) => _productData.SoftDeleteAsync(id);

    public Task<bool> HardDeleteAsync(int id) => _productData.HardDeleteAsync(id);
}
