using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;

namespace BankingApp.Swagger
{
    public class SessionHeaderFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Nếu danh sách tham số rỗng thì khởi tạo mới
            if (operation.Parameters == null)
            {
                operation.Parameters = new List<OpenApiParameter>();
            }

            // Thêm một ô nhập tham số tên là "x-session" nằm ở Header
            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "x-session",
                In = ParameterLocation.Header,
                Description = "Nhập Session ID lấy được từ API /api/login vào đây",
                Required = false, // Đặt là false để API Đăng ký/Đăng nhập không bắt buộc phải nhập
                Schema = new OpenApiSchema
                {
                    Type = "string"
                }
            });
        }
    }
}