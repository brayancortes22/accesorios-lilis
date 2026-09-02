using AccesoriosLilis.Api.Entity.Model;
using AccesoriosLilis.Api.Entity.Dtos;

namespace AccesoriosLilis.Api.Business.Interfaces;

public interface IProductBusiness : IBaseBusiness<Product, ProductDto>
{
    Task<List<Product>> GetByCategoryAsync(string category);
}
