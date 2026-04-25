# Bước 1: Build dự án Console
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

# Bước 2: Chạy ứng dụng trên môi trường .NET Runtime
FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY --from=build /app/out .

# Mở cổng 8080 (Cổng Socket Server)
EXPOSE 8080

ENTRYPOINT ["dotnet", "HttpServerCore.dll"]