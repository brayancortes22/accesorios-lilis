# Dockerfile para ASP.NET Core 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar csproj y restaurar paquetes
COPY ["AccesoriosLilis.Api.csproj", "./"]
RUN dotnet restore "AccesoriosLilis.Api.csproj"

# Copiar el resto del código y compilar versión Release
COPY . .
RUN dotnet publish "AccesoriosLilis.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagen de producción ligera
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS="http://+:8080"
EXPOSE 8080

ENTRYPOINT ["dotnet", "AccesoriosLilis.Api.dll"]
