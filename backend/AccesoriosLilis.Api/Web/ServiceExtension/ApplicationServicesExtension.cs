using AccesoriosLilis.Api.Business.Implements;
using AccesoriosLilis.Api.Business.Interfaces;
using AccesoriosLilis.Api.Data.Implements;
using AccesoriosLilis.Api.Data.Interfaces;
using AccesoriosLilis.Api.Utilities.Security;

namespace AccesoriosLilis.Api.Web.ServiceExtension;

public static class ApplicationServicesExtension
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductBusiness, ProductBusiness>();
        services.AddScoped<IProductData, ProductData>();

        services.AddScoped<ICategoryBusiness, CategoryBusiness>();
        services.AddScoped<ICategoryData, CategoryData>();

        services.AddScoped<IOrderBusiness, OrderBusiness>();
        services.AddScoped<IOrderData, OrderData>();

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ICaptchaService, CaptchaService>();
        services.AddScoped<IAuthBusiness, AuthBusiness>();

        return services;
    }
}
