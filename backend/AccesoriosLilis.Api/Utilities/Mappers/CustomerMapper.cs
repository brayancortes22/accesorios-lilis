using AccesoriosLilis.Api.Entity.Dtos;
using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Utilities.Mappers;

public static class CustomerMapper
{
    public static Customer ToEntity(this CustomerDto dto)
    {
        return new Customer
        {
            Id = dto.Id,
            FullName = dto.FullName.Trim(),
            Phone = dto.Phone.Trim(),
            City = dto.City?.Trim() ?? "Algeciras",
            Notes = dto.Notes?.Trim(),
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static CustomerDto ToDto(this Customer entity)
    {
        return new CustomerDto
        {
            Id = entity.Id,
            FullName = entity.FullName,
            Phone = entity.Phone,
            City = entity.City,
            Notes = entity.Notes,
            IsActive = entity.IsActive
        };
    }

    public static void UpdateEntity(this Customer entity, CustomerDto dto)
    {
        entity.FullName = dto.FullName.Trim();
        entity.Phone = dto.Phone.Trim();
        entity.City = dto.City?.Trim() ?? entity.City;
        entity.Notes = dto.Notes?.Trim() ?? entity.Notes;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
    }
}
