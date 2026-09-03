using AccesoriosLilis.Api.Entity.Model;
using AccesoriosLilis.Api.Utilities.Security;
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

            // Asegura la existencia y actualización de todas las tablas y columnas en producción
            await SynchronizeDatabaseSchemaAsync(context, logger);

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
                        Name = "Aretes Flor Tejidos a Mano",
                        Category = "aretes",
                        Description = "Hermosos aretes 100% tejidos a mano con mostacilla fina y herrajes hipoalergénicos.",
                        Price = 35000,
                        Stock = 12,
                        ImageUrl = "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Collar Artesanal Perla y Cristales",
                        Category = "collares",
                        Description = "Gargantilla delicada tejida a mano con dije de perla y cristales finos.",
                        Price = 48000,
                        Stock = 8,
                        ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Name = "Pulsera Macramé Piedra Amatista",
                        Category = "pulseras",
                        Description = "Pulsera artesanal tejida con cuarzos naturales y mostacilla de alta resistencia.",
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
                        Name = "Bolso Artesanal Palma de Iraca",
                        Category = "bolsos",
                        Description = "Bolso tejido a mano por artesanas colombianas con detalles en cuero vegano.",
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
                        Description = "Aretes colgantes tejidos con cristales finos para resaltar cualquier look especial.",
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
                        Description = "Cadena eslabonada artesanal con dije de cristal y mostacilla japonesa.",
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
                        Description = "Pulsera protectora tejida con mostacilla fina y dije central esmaltado.",
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

            // 3. Sembrado de Administradores Iniciales en MySQL con Contraseña Cifrada
            var defaultAdminHash = PasswordHasher.HashPassword("Lilis2026*");

            var initialAdmins = new List<User>
            {
                new()
                {
                    Email = "lombanaliliana64@gmail.com",
                    FullName = "Liliana Lombana (Dueña)",
                    Role = "Admin",
                    PictureUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                    PasswordHash = defaultAdminHash,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Email = "brayanstidcorteslombana@gmail.com",
                    FullName = "Brayan Stid Cortes (Desarrollador)",
                    Role = "Admin",
                    PictureUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
                    PasswordHash = defaultAdminHash,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Email = "bscl20062007@gmail.com",
                    FullName = "BSCL Admin",
                    Role = "Admin",
                    PictureUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
                    PasswordHash = defaultAdminHash,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Email = "admin@accesorioslilis.com",
                    FullName = "Administración Lilis",
                    Role = "Admin",
                    PasswordHash = defaultAdminHash,
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
                else
                {
                    if (existingUser.Role != "Admin")
                    {
                        existingUser.Role = "Admin";
                        existingUser.IsActive = true;
                        existingUser.UpdatedAt = DateTime.UtcNow;
                    }
                    if (string.IsNullOrWhiteSpace(existingUser.PasswordHash))
                    {
                        existingUser.PasswordHash = defaultAdminHash;
                        existingUser.UpdatedAt = DateTime.UtcNow;
                    }
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

    private static async Task SynchronizeDatabaseSchemaAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Sincronizando esquema de base de datos y verificando columnas en producción...");

        var createTableSqls = new[]
        {
            @"CREATE TABLE IF NOT EXISTS `Users` (
                `Id` INT NOT NULL AUTO_INCREMENT,
                `Email` VARCHAR(150) NOT NULL,
                `FullName` VARCHAR(150) NOT NULL,
                `Role` VARCHAR(50) NOT NULL DEFAULT 'Customer',
                `PictureUrl` VARCHAR(500) NULL,
                `PasswordHash` VARCHAR(255) NULL,
                `LastLoginAt` DATETIME NULL,
                `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `UpdatedAt` DATETIME NULL,
                `DeletedAt` DATETIME NULL,
                PRIMARY KEY (`Id`),
                UNIQUE KEY `IX_Users_Email` (`Email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            @"CREATE TABLE IF NOT EXISTS `Products` (
                `Id` INT NOT NULL AUTO_INCREMENT,
                `Name` VARCHAR(200) NOT NULL,
                `Category` VARCHAR(100) NULL,
                `Price` DECIMAL(18,2) NOT NULL DEFAULT 0,
                `Stock` INT NOT NULL DEFAULT 10,
                `ImageUrl` LONGTEXT NULL,
                `Description` TEXT NULL,
                `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `UpdatedAt` DATETIME NULL,
                `DeletedAt` DATETIME NULL,
                PRIMARY KEY (`Id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            @"CREATE TABLE IF NOT EXISTS `Categories` (
                `Id` INT NOT NULL AUTO_INCREMENT,
                `Name` VARCHAR(100) NOT NULL,
                `Description` TEXT NULL,
                `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `UpdatedAt` DATETIME NULL,
                `DeletedAt` DATETIME NULL,
                PRIMARY KEY (`Id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            @"CREATE TABLE IF NOT EXISTS `Customers` (
                `Id` INT NOT NULL AUTO_INCREMENT,
                `FullName` VARCHAR(150) NOT NULL,
                `Phone` VARCHAR(30) NULL,
                `City` VARCHAR(150) NULL,
                `Notes` TEXT NULL,
                `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `UpdatedAt` DATETIME NULL,
                `DeletedAt` DATETIME NULL,
                PRIMARY KEY (`Id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            @"CREATE TABLE IF NOT EXISTS `Orders` (
                `Id` INT NOT NULL AUTO_INCREMENT,
                `CustomerId` INT NOT NULL,
                `Total` DECIMAL(18,2) NOT NULL DEFAULT 0,
                `Status` VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
                `Notes` TEXT NULL,
                `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `UpdatedAt` DATETIME NULL,
                `DeletedAt` DATETIME NULL,
                PRIMARY KEY (`Id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            @"CREATE TABLE IF NOT EXISTS `OrderItems` (
                `Id` INT NOT NULL AUTO_INCREMENT,
                `OrderId` INT NOT NULL,
                `ProductId` INT NOT NULL,
                `Quantity` INT NOT NULL DEFAULT 1,
                `UnitPrice` DECIMAL(18,2) NOT NULL DEFAULT 0,
                `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
                `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `UpdatedAt` DATETIME NULL,
                `DeletedAt` DATETIME NULL,
                PRIMARY KEY (`Id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
        };

        foreach (var sql in createTableSqls)
        {
            try { await context.Database.ExecuteSqlRawAsync(sql); } catch { }
        }

        var alterColumnSqls = new[]
        {
            // Users
            "ALTER TABLE `Users` ADD COLUMN `PasswordHash` VARCHAR(255) NULL;",
            "ALTER TABLE `Users` ADD COLUMN `LastLoginAt` DATETIME NULL;",
            "ALTER TABLE `Users` ADD COLUMN `PictureUrl` VARCHAR(500) NULL;",
            "ALTER TABLE `Users` ADD COLUMN `Role` VARCHAR(50) NOT NULL DEFAULT 'Customer';",

            // Products
            "ALTER TABLE `Products` MODIFY COLUMN `ImageUrl` LONGTEXT NULL;",
            "ALTER TABLE `Products` ADD COLUMN `Stock` INT NOT NULL DEFAULT 10;",
            "ALTER TABLE `Products` ADD COLUMN `Description` TEXT NULL;",
            "ALTER TABLE `Products` ADD COLUMN `Category` VARCHAR(100) NULL;",
            "ALTER TABLE `Products` ADD COLUMN `Price` DECIMAL(18,2) NOT NULL DEFAULT 0;",

            // Customers
            "ALTER TABLE `Customers` ADD COLUMN `City` VARCHAR(150) NULL;",
            "ALTER TABLE `Customers` ADD COLUMN `Notes` TEXT NULL;",

            // Orders
            "ALTER TABLE `Orders` ADD COLUMN `Status` VARCHAR(50) NOT NULL DEFAULT 'Pendiente';",
            "ALTER TABLE `Orders` ADD COLUMN `Notes` TEXT NULL;",
            "ALTER TABLE `Orders` ADD COLUMN `Total` DECIMAL(18,2) NOT NULL DEFAULT 0;",

            // OrderItems
            "ALTER TABLE `OrderItems` ADD COLUMN `Quantity` INT NOT NULL DEFAULT 1;",
            "ALTER TABLE `OrderItems` ADD COLUMN `UnitPrice` DECIMAL(18,2) NOT NULL DEFAULT 0;"
        };

        foreach (var sql in alterColumnSqls)
        {
            try { await context.Database.ExecuteSqlRawAsync(sql); } catch { }
        }

        // Corrección de productos antiguos con la palabra Miyuki
        try
        {
            await context.Database.ExecuteSqlRawAsync("UPDATE `Products` SET `Name` = REPLACE(`Name`, 'Miyuki', 'Mostacilla Fina'), `Description` = REPLACE(`Description`, 'Miyuki', 'mostacilla fina artesanal') WHERE `Name` LIKE '%Miyuki%' OR `Description` LIKE '%Miyuki%';");
        }
        catch { }
    }
}
