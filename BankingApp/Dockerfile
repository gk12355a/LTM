# Bước 1: Sử dụng SDK .NET 8 để Build code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy các file dự án và khôi phục thư viện (Restore)
COPY *.csproj ./
RUN dotnet restore

# Copy toàn bộ code và build dự án
COPY . ./
RUN dotnet publish -c Release -o out

# Bước 2: Sử dụng Runtime nhỏ gọn để chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Mở cổng 5156 (Cổng mà API đang chạy)
EXPOSE 5156
ENV ASPNETCORE_URLS=http://+:5156

ENTRYPOINT ["dotnet", "BankingApp.dll"]