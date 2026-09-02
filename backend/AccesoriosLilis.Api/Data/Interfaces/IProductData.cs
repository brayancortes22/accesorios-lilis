using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Data.Interfaces;

public interface IProductData : IBaseData<Product>
{
    Task<List<Product>> GetByCategoryAsync(string category);
}
