using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OTMS.API.Middleware;
using OTMS.API.Profile;
using OTMS.BLL.Models;
using OTMS.BLL.Services;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//DbContext
builder.Services.AddDbContext<OtmsContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

//Memory-Cache
builder.Services.AddMemoryCache();

//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        policy =>
        {
            policy.WithOrigins(
                builder.Configuration["Jwt:Issuer"],
                "https://192.168.0.100:3000"
                )
                  .AllowCredentials()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

//DI
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IClassRepository, ClassRepository>();
builder.Services.AddScoped<IClassStudentRepository, ClassStudentRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<IScheduleSolverService, ScheduleSolverService>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IClassSettingRepository, ClassSettingRepository>();
builder.Services.AddScoped<ILecturerScheduleRepository, LecturerScheduleRepository>();
builder.Services.AddScoped<IParentRepository, ParentRepository>();

//Service
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddSingleton<IPasswordService, PasswordService>();

//Email
builder.Services.AddSingleton<IEmailService, EmailService>();
builder.Services.AddHostedService<EmailBackgroundService>();

//DI DAO
builder.Services.AddScoped<AccountDAO>();
builder.Services.AddScoped<ClassDAO>();
builder.Services.AddScoped<ClassStudentDAO>();
builder.Services.AddScoped<RoleDAO>();
builder.Services.AddScoped<ScheduleDAO>();
builder.Services.AddScoped<UserDAO>();
builder.Services.AddScoped<RefreshTokenDAO>();
builder.Services.AddScoped<SessionDAO>();
builder.Services.AddScoped<CourseDAO>();
builder.Services.AddScoped<AttendanceDAO>();
builder.Services.AddScoped<ClassSettingDAO>();
builder.Services.AddScoped<LecturerScheduleDAO>();
builder.Services.AddScoped<ParentDAO>();


//SignalR
//builder.Services.AddSignalR();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
//Authorization
builder.Services.AddAuthorization(async options =>
{
    using (var scope = builder.Services.BuildServiceProvider().CreateScope())
    {
        //var roleRepository = scope.ServiceProvider.GetRequiredService<IRoleRepository>();

        // Get role id from database
        //var adminRoleId = (await roleRepository.GetByNameAsync("admin"))?.Id.ToString();

        //options.AddPolicy("AdminOnly", policy => policy.RequireClaim("roleId", adminRoleId!));
    }
});

builder.Services.AddSwaggerGen(c =>
{
    // Cấu hình JWT Authentication cho Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token JWT của bạn như sau: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


//loop
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

//cors
app.UseCors("AllowLocalhost");

app.UseHttpsRedirection();

//authentication
app.UseAuthentication();

//custom middleware
app.UseMiddleware<CustomResponseMiddleware>();

//authorization
app.UseAuthorization();

app.MapControllers();

app.Run();


