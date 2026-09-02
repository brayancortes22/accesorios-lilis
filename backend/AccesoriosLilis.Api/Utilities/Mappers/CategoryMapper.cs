using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Utilities.Mappers;

public static class CategoryMapper
{
    public static Category ToEntity(this CategoryDto dto)
    {
        return new Category
        {
            Id = dto.Id,
            Name = dto.Name.Trim(),
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static CategoryDto ToDto(this Category entity)
    {
        return new CategoryDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            IsActive = entity.IsActive
        };
    }

    public static void UpdateEntity(this Category entity, CategoryDto dto)
    {
        entity.Name = dto.Name.Trim();
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
    }

    public static List<CategoryDto> ToDtoList(this IEnumerable<Category> entities)
    {
        return entities.Select(ToDto).ToList();
    }
}
