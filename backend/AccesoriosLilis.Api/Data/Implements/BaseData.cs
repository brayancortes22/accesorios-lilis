using AccesoriosLilis.Api.Data.Interfaces;
using Microsoft.EntityFrameworkCore;
using AccesoriosLilis.Api.Entity.Context;

namespace AccesoriosLilis.Api.Data.Implements;

public abstract class BaseData<TEntity> : IBaseData<TEntity>
    where TEntity : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    protected BaseData(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<TEntity>();
    }

    public virtual async Task<List<TEntity>> GetAllAsync() => await _dbSet.ToListAsync();

    public virtual async Task<TEntity?> GetByIdAsync(int id) => await _dbSet.FindAsync(id) as TEntity;

    public virtual async Task<TEntity> CreateAsync(TEntity entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<TEntity?> UpdateAsync(int id, TEntity entity)
    {
        var existing = await _dbSet.FindAsync(id);
        if (existing is null)
        {
            return null;
        }

        _context.Entry(existing).CurrentValues.SetValues(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<TEntity?> SoftDeleteAsync(int id)
    {
        var entity = await _dbSet.FindAsync(id) as dynamic;
        if (entity is null)
        {
            return null;
        }

        var isActiveProperty = entity.GetType().GetProperty("IsActive");
        var deletedAtProperty = entity.GetType().GetProperty("DeletedAt");

        if (isActiveProperty is not null)
        {
            isActiveProperty.SetValue(entity, false);
        }

        if (deletedAtProperty is not null)
        {
            deletedAtProperty.SetValue(entity, DateTime.UtcNow);
        }

        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<bool> HardDeleteAsync(int id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity is null)
        {
            return false;
        }

        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
