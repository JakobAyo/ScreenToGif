using System.Text.Json.Serialization;
using ScreenToGif.Backend.Capture;
using ScreenToGif.Backend.Encoding;
using ScreenToGif.Backend.Hubs;
using ScreenToGif.Backend.Services;
using ScreenToGif.Backend.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Parse port from command line arguments
var port = 5001;
for (int i = 0; i < args.Length; i++)
{
    if (args[i] == "--port" && i + 1 < args.Length)
    {
        if (int.TryParse(args[i + 1], out var parsedPort))
        {
            port = parsedPort;
        }
    }
}

builder.WebHost.UseUrls($"http://localhost:{port}");

// Add controllers with JSON serialization options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Add SignalR
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Add HttpClient for upload service
builder.Services.AddHttpClient();

// Add CORS for development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    // Named policy for SignalR (requires credentials)
    options.AddPolicy("SignalR", policy =>
    {
        policy.WithOrigins("http://localhost:1420", "http://localhost:5173", "tauri://localhost")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Register factories
builder.Services.AddSingleton<ICaptureStrategyFactory, CaptureStrategyFactory>();
builder.Services.AddSingleton<IEncoderFactory, EncoderFactory>();

// Register services
builder.Services.AddSingleton<IProjectService, ProjectService>();
builder.Services.AddSingleton<ICaptureService, CaptureService>();
builder.Services.AddSingleton<IEncodingService, EncodingService>();
builder.Services.AddSingleton<IFrameService, FrameService>();
builder.Services.AddScoped<IImageProcessingService, ImageProcessingService>();
builder.Services.AddScoped<IUploadService, UploadService>();

// Add API documentation
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Use CORS
app.UseCors();

// Enable WebSockets for SignalR
app.UseWebSockets();

// Map controllers
app.MapControllers();

// Map SignalR hubs
app.MapHub<CaptureHub>("/hubs/capture").RequireCors("SignalR");
app.MapHub<ProgressHub>("/hubs/progress").RequireCors("SignalR");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "0.2.0"
}));

// API info endpoint
app.MapGet("/api/info", () => Results.Ok(new
{
    name = "ScreenToGif Backend",
    version = "0.2.0",
    platform = Environment.OSVersion.Platform.ToString(),
    runtime = Environment.Version.ToString(),
    endpoints = new
    {
        capture = "/api/capture",
        encoding = "/api/encoding",
        project = "/api/project",
        imageProcessing = "/api/imageprocessing",
        upload = "/api/upload",
        frames = "/api/frame"
    },
    hubs = new
    {
        capture = "/hubs/capture",
        progress = "/hubs/progress"
    }
}));

// Ping endpoint for connectivity testing
app.MapGet("/api/ping", () => Results.Ok(new { message = "pong", timestamp = DateTime.UtcNow }));

Console.WriteLine($"ScreenToGif Backend v0.2.0 starting on port {port}...");
Console.WriteLine($"API endpoints available at http://localhost:{port}/api/");
Console.WriteLine($"SignalR hubs available at http://localhost:{port}/hubs/");
app.Run();
