using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Utilities.Mappers;

public static class ProductMapper
{
    public static Product ToEntity(this ProductDto dto)
    {
        return new Product
        {
            Id = dto.Id,
            Name = dto.Name.Trim(),
            Category = dto.Category,
            Price = dto.Price,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static ProductDto ToDto(this Product entity)
    {
        return new ProductDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Category = entity.Category,
            Price = entity.Price,
            Stock = entity.Stock,
            ImageUrl = entity.ImageUrl,
            Description = entity.Description,
            IsActive = entity.IsActive
        };
    }

    public static void UpdateEntity(this Product entity, ProductDto dto)
    {
        entity.Name = dto.Name.Trim();
        entity.Category = dto.Category;
        entity.Price = dto.Price;
        entity.Stock = dto.Stock;
        entity.ImageUrl = dto.ImageUrl;
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
    }

    public static List<ProductDto> ToDtoList(this IEnumerable<Product> entities)
    {
        return entities.Select(ToDto).ToList();
    }
}
