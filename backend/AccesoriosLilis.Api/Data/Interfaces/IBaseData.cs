namespace AccesoriosLilis.Api.Data.Interfaces;

public interface IBaseData<TEntity>
    where TEntity : class
{
    Task<List<TEntity>> GetAllAsync();
    Task<TEntity?> GetByIdAsync(int id);
    Task<TEntity> CreateAsync(TEntity entity);
    Task<TEntity?> UpdateAsync(int id, TEntity entity);
    Task<TEntity?> SoftDeleteAsync(int id);
    Task<bool> HardDeleteAsync(int id);
}
