using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Data.Interfaces;

namespace AccesoriosLilis.Api.Business.Implements;

public abstract class BaseBusiness<TEntity, TDto> : IBaseBusiness<TEntity, TDto>
    where TEntity : class
    where TDto : class
{
    protected readonly IBaseData<TEntity> _data;

    protected BaseBusiness(IBaseData<TEntity> data)
    {
        _data = data;
    }

    public virtual Task<List<TEntity>> GetAllAsync() => _data.GetAllAsync();

    public virtual Task<TEntity?> GetByIdAsync(int id) => _data.GetByIdAsync(id);

    public abstract Task<TEntity> CreateAsync(TDto dto);

    public abstract Task<TEntity?> UpdateAsync(int id, TDto dto);

    public virtual Task<TEntity?> SoftDeleteAsync(int id) => _data.SoftDeleteAsync(id);

    public virtual Task<bool> HardDeleteAsync(int id) => _data.HardDeleteAsync(id);
}
