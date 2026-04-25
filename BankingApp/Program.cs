using BankingApp.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Database MySQL (giữ nguyên của bạn)
var server = "192.168.23.60";
var user = "laptrinhmang";
var password = "laptrinhmang";
var database = "banking_db";

var connectionString = $"server={server};user={user};password={password};database={database}";
var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));

builder.Services.AddControllers();

// 1. ĐĂNG KÝ DỊCH VỤ SWAGGER
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Đăng ký bộ lọc tạo Header x-session
    options.OperationFilter<BankingApp.Swagger.SessionHeaderFilter>();
});

var app = builder.Build();

// 2. KÍCH HOẠT GIAO DIỆN SWAGGER
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.Run();