namespace AccesoriosLilis.Api.Business
{
    public interface IBaseCrudBusiness<TEntity, TCreateDto>
        where TEntity : class
    {
        Task<List<TEntity>> GetAllAsync();
        Task<TEntity?> GetByIdAsync(int id);
        Task<TEntity> CreateAsync(TCreateDto dto);
        Task<TEntity?> UpdateAsync(int id, TCreateDto dto);
        Task<TEntity?> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);
    }

    public abstract class BaseCrudBusiness<TEntity, TCreateDto> : IBaseCrudBusiness<TEntity, TCreateDto>
        where TEntity : class
    {
        public abstract Task<List<TEntity>> GetAllAsync();
        public abstract Task<TEntity?> GetByIdAsync(int id);
        public abstract Task<TEntity> CreateAsync(TCreateDto dto);
        public abstract Task<TEntity?> UpdateAsync(int id, TCreateDto dto);
        public abstract Task<TEntity?> SoftDeleteAsync(int id);
        public abstract Task<bool> HardDeleteAsync(int id);
    }
}

namespace AccesoriosLilis.Api.Data
{
    public interface IBaseCrudData<TEntity>
        where TEntity : class
    {
        Task<List<TEntity>> GetAllAsync();
        Task<TEntity?> GetByIdAsync(int id);
        Task<TEntity> CreateAsync(TEntity entity);
        Task<TEntity?> UpdateAsync(int id, TEntity entity);
        Task<TEntity?> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);
    }

    public abstract class BaseCrudData<TEntity> : IBaseCrudData<TEntity>
        where TEntity : class
    {
        public abstract Task<List<TEntity>> GetAllAsync();
        public abstract Task<TEntity?> GetByIdAsync(int id);
        public abstract Task<TEntity> CreateAsync(TEntity entity);
        public abstract Task<TEntity?> UpdateAsync(int id, TEntity entity);
        public abstract Task<TEntity?> SoftDeleteAsync(int id);
        public abstract Task<bool> HardDeleteAsync(int id);
    }
}
