using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Entity.Context;
using AccesoriosLilis.Api.Entity.Model;

namespace AccesoriosLilis.Api.Data.Implements;

public class CategoryData : BaseData<Category>, ICategoryData
{
    public CategoryData(ApplicationDbContext context)
        : base(context)
    {
    }
}
