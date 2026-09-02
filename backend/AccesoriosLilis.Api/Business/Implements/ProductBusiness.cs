using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using AccesoriosLilis.Api.Utilities.Exceptions;
using AccesoriosLilis.Api.Utilities.Mappers;

namespace AccesoriosLilis.Api.Business.Implements;

public class ProductBusiness : BaseBusiness<Product, ProductDto>, IProductBusiness
{
    public ProductBusiness(IProductData data)
        : base(data)
    {
    }

    public override async Task<Product> CreateAsync(ProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new BusinessException("El nombre del producto es obligatorio.");
        }

        var entity = dto.ToEntity();
        return await _data.CreateAsync(entity);
    }

    public override async Task<Product?> UpdateAsync(int id, ProductDto dto)
    {
        var current = await _data.GetByIdAsync(id);
        if (current is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new BusinessException("El nombre del producto es obligatorio.");
        }

        current.UpdateEntity(dto);
        return await _data.UpdateAsync(id, current);
    }

    public async Task<List<Product>> GetByCategoryAsync(string category)
    {
        var all = await _data.GetAllAsync();
        return all.Where(x => x.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
    }
}
