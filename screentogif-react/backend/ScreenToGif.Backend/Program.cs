using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

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

// Add CORS for development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();
app.UseWebSockets();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// API info endpoint
app.MapGet("/api/info", () => Results.Ok(new
{
    name = "ScreenToGif Backend",
    version = "0.1.0",
    platform = Environment.OSVersion.Platform.ToString(),
    runtime = Environment.Version.ToString()
}));

// Ping endpoint for connectivity testing
app.MapGet("/api/ping", () => Results.Ok(new { message = "pong", timestamp = DateTime.UtcNow }));

// WebSocket endpoint for real-time communication
app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await HandleWebSocketConnection(webSocket);
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});

Console.WriteLine($"ScreenToGif Backend starting on port {port}...");
app.Run();

static async Task HandleWebSocketConnection(WebSocket webSocket)
{
    var buffer = new byte[1024 * 4];

    // Send welcome message
    var welcomeMessage = JsonSerializer.Serialize(new
    {
        type = "connected",
        message = "Connected to ScreenToGif Backend",
        timestamp = DateTime.UtcNow
    });
    var welcomeBytes = Encoding.UTF8.GetBytes(welcomeMessage);
    await webSocket.SendAsync(new ArraySegment<byte>(welcomeBytes), WebSocketMessageType.Text, true, CancellationToken.None);

    var receiveResult = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

    while (!receiveResult.CloseStatus.HasValue)
    {
        var receivedMessage = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);

        try
        {
            var request = JsonSerializer.Deserialize<JsonElement>(receivedMessage);
            var messageType = request.TryGetProperty("type", out var typeElement) ? typeElement.GetString() : "unknown";

            var response = messageType switch
            {
                "ping" => new { type = "pong", timestamp = DateTime.UtcNow },
                "echo" => new { type = "echo", data = request.TryGetProperty("data", out var dataElement) ? dataElement.ToString() : "", timestamp = DateTime.UtcNow },
                _ => new { type = "error", message = $"Unknown message type: {messageType}", timestamp = DateTime.UtcNow }
            };

            var responseJson = JsonSerializer.Serialize(response);
            var responseBytes = Encoding.UTF8.GetBytes(responseJson);
            await webSocket.SendAsync(new ArraySegment<byte>(responseBytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }
        catch (JsonException)
        {
            var errorResponse = JsonSerializer.Serialize(new { type = "error", message = "Invalid JSON format", timestamp = DateTime.UtcNow });
            var errorBytes = Encoding.UTF8.GetBytes(errorResponse);
            await webSocket.SendAsync(new ArraySegment<byte>(errorBytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        receiveResult = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    }

    await webSocket.CloseAsync(receiveResult.CloseStatus.Value, receiveResult.CloseStatusDescription, CancellationToken.None);
}
