using AccesoriosLilis.Api.Entity.Model;
using Microsoft.EntityFrameworkCore;

namespace AccesoriosLilis.Api.Entity.Context;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");

        try
        {
            logger.LogInformation("Verificando y asegurando la base de datos MySQL...");
            
            // Intenta aplicar migraciones o asegurar creación de la base de datos
            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            if (pendingMigrations.Any())
            {
                logger.LogInformation("Aplicando migraciones pendientes...");
                await context.Database.MigrateAsync();
            }
            else
            {
                await context.Database.EnsureCreatedAsync();
            }

            // Asegura la existencia de la tabla Users en MySQL
            var createUsersTableSql = @"
                CREATE TABLE IF NOT EXISTS `Users` (
                    `Id` INT NOT NULL AUTO_INCREMENT,
                    `Email` VARCHAR(150) NOT NULL,
                    `FullName` VARCHAR(150) NOT NULL,
                    `Role` VARCHAR(50) NOT NULL DEFAULT 'Customer',
                    `PictureUrl` VARCHAR(500) NULL,
                    `LastLoginAt` DATETIME NULL,
                    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                    `CreatedAt` DATETIME NOT NULL,
                    `UpdatedAt` DATETIME NULL,
                    `DeletedAt` DATETIME NULL,
                    PRIMARY KEY (`Id`),
                    UNIQUE KEY `IX_Users_Email` (`Email`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

            await context.Database.ExecuteSqlRawAsync(createUsersTableSql);

            try
            {
                await context.Database.ExecuteSqlRawAsync("ALTER TABLE `Products` MODIFY COLUMN `ImageUrl` LONGTEXT NULL;");
            }
            catch
            {
                // Ignorar si ya está aplicado
            }

            // 1. Sembrado de Categorías
            if (!await context.Categories.AnyAsync())
            {
                logger.LogInformation("Sembrando categorías iniciales...");
                var categories = new List<Category>
                {
                    new() { Name = "Aretes y Candongas", Description = "Candongas en baño de oro, topos y aretes largos de fiesta.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new() { Name = "Collares y Gargantillas", Description = "Cadenas dobles, perlas barrocas y gargantillas de acero.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new() { Name = "Pulseras y Manillas", Description = "Pulseras tejidas, piedras naturales y ojos turcos.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new() { Name = "Anillos y Sets", Description = "Anillos ajustables con zirconias y sets dorados.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new() { Name = "Bolsos y Carteras", Description = "Bolsos de mano, carteras estructuradas y monederos.", IsActive = true, CreatedAt = DateTime.UtcNow }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            // 2. Sembrado de Productos Iniciales
            if (!await context.Products.AnyAsync())
            {
                logger.LogInformation("Sembrando catálogo de productos inicial...");
                var products = new List<Product>
                {
                    new()
                    {
                        Name = "Aretes Candonga Baño en Oro",
                        Category = "aretes",
                        Description = "Elegantes candongas con acabado brillante en oro golfi, hipoalergénicas y ligeras.",
                        Price = 35000,
                        Stock = 12,
                        ImageUrl = "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Collar Doble Perla Barroca",
                        Category = "collares",
                        Description = "Cadena delicada de doble capa con dije de perla natural cultivada.",
                        Price = 48000,
                        Stock = 8,
                        ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Pulsera Ajustable Piedra Amatista",
                        Category = "pulseras",
                        Description = "Pulsera artesanal tejida con cuarzos y apliques en oro laminado.",
                        Price = 28000,
                        Stock = 15,
                        ImageUrl = "https://images.unsplash.com/photo-1611591475155-4286fafb33e6?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Set de Anillos Florales Zirconia",
                        Category = "anillos",
                        Description = "Set de 3 anillos ajustables con incrustaciones de zirconias brillantes.",
                        Price = 42000,
                        Stock = 6,
                        ImageUrl = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Bolso de Mano Cuero Sintético Rosa",
                        Category = "bolsos",
                        Description = "Cartera estructurada femenina con correa removible y herrajes dorados.",
                        Price = 75000,
                        Stock = 4,
                        ImageUrl = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Aretes Largos Flecos de Cristal",
                        Category = "aretes",
                        Description = "Aretes colgantes de fiesta para resaltar cualquier look de gala o noche.",
                        Price = 32000,
                        Stock = 10,
                        ImageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Gargantilla Minimalista Eslabón",
                        Category = "collares",
                        Description = "Cadena eslabonada moderna en acero inoxidable dorado de alta durabilidad.",
                        Price = 39000,
                        Stock = 9,
                        ImageUrl = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Manilla Ojo Turco Protección",
                        Category = "pulseras",
                        Description = "Pulsera protectora con mostacilla japonesa y dije central esmaltado.",
                        Price = 22000,
                        Stock = 20,
                        ImageUrl = "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await context.Products.AddRangeAsync(products);
                await context.SaveChangesAsync();
            }

            // 3. Sembrado de Administradores Iniciales en MySQL
            var initialAdmins = new List<User>
            {
                new()
                {
                    Email = "bscl20062007@gmail.com",
                    FullName = "BSCL Admin",
                    Role = "Admin",
                    PictureUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Email = "liliana.lombana@gmail.com",
                    FullName = "Liliana Lombana Polania",
                    Role = "Admin",
                    PictureUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Email = "admin@accesorioslilis.com",
                    FullName = "Administración Lilis",
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            foreach (var adm in initialAdmins)
            {
                var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == adm.Email.ToLower());
                if (existingUser is null)
                {
                    logger.LogInformation("Sembrando administrador {Email} en la base de datos...", adm.Email);
                    await context.Users.AddAsync(adm);
                }
                else if (existingUser.Role != "Admin")
                {
                    existingUser.Role = "Admin";
                    existingUser.IsActive = true;
                    existingUser.UpdatedAt = DateTime.UtcNow;
                }
            }
            await context.SaveChangesAsync();

            logger.LogInformation("Base de datos y datos iniciales listos.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Aviso: No se pudo conectar a MySQL o inicializar la base de datos automáticamente. Verifica si el servicio MySQL está activo y las credenciales en .env.");
        }
    }
}
