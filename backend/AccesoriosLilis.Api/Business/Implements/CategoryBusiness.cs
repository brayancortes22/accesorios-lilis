using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;
using AccesoriosLilis.Api.Utilities.Exceptions;
using AccesoriosLilis.Api.Utilities.Mappers;

namespace AccesoriosLilis.Api.Business.Implements;

public class CategoryBusiness : BaseBusiness<Category, CategoryDto>, ICategoryBusiness
{
    public CategoryBusiness(ICategoryData data)
        : base(data)
    {
    }

    public override async Task<Category> CreateAsync(CategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new BusinessException("El nombre de la categoría es obligatorio.");
        }

        var entity = dto.ToEntity();
        return await _data.CreateAsync(entity);
    }

    public override async Task<Category?> UpdateAsync(int id, CategoryDto dto)
    {
        var current = await _data.GetByIdAsync(id);
        if (current is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new BusinessException("El nombre de la categoría es obligatorio.");
        }

        current.UpdateEntity(dto);
        return await _data.UpdateAsync(id, current);
    }
}
