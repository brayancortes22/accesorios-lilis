namespace AccesoriosLilis.Api.Business.Interfaces;

public interface IBaseBusiness<TEntity, TDto>
    where TEntity : class
    where TDto : class
{
    Task<List<TEntity>> GetAllAsync();
    Task<TEntity?> GetByIdAsync(int id);
    Task<TEntity> CreateAsync(TDto dto);
    Task<TEntity?> UpdateAsync(int id, TDto dto);
    Task<TEntity?> SoftDeleteAsync(int id);
    Task<bool> HardDeleteAsync(int id);
}
