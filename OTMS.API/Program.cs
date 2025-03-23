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
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

    options.AddPolicy("AllowLocalhost",
        policy =>
        {
            policy.WithOrigins(allowedOrigins ?? new string[0]) // Tránh lỗi null
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
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IRecordRepository, RecordReposiroty>();
builder.Services.AddScoped<IProfileChangeRequestRepository, ProfileChangeRequestRepository>();


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
builder.Services.AddScoped<NotificationDAO>();
builder.Services.AddScoped<RecordDAO>();
builder.Services.AddScoped<ProfileChangeRequestDAO>();


//SignalR
//builder.Services.AddSignalR();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing from configuration.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromMinutes(5),

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

//Authorization
builder.Services.AddAuthorization(options =>
{
    // 1. AdminOnly
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "ur" && c.Value == "admin")
        )
    );

    // 2. OfficerOnly
    options.AddPolicy("OfficerOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "ur" && c.Value == "officer")
        )
    );

    // 3. StudentOnly
    options.AddPolicy("StudentOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "ur" && c.Value == "student")
        )
    );

    // 4. LecturerOnly
    options.AddPolicy("LecturerOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "ur" && c.Value == "lecturer")
        )
    );

    // 5. ExceptStudent (cho phép tất cả trừ student)
    options.AddPolicy("ExceptStudent", policy =>
        policy.RequireAssertion(context =>
            !context.User.HasClaim(c => c.Type == "ur" && c.Value == "student")
        )
    );

    // 6. Admin và Officer
    options.AddPolicy("AdminAndOfficer", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "ur" && (c.Value == "admin" || c.Value == "officer"))
        )
    );

    // 7. Officer và Lecturer
    options.AddPolicy("OfficerAndLecturer", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "ur" && (c.Value == "officer" || c.Value == "lecturer"))
        )
    );
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


