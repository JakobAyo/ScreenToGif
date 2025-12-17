using Microsoft.AspNetCore.SignalR;
using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Hubs;

public interface IProgressHubClient
{
    Task OnEncodingProgress(EncodingProgressDto progress);
    Task OnEncodingComplete(EncodingCompleteResponseDto response);
    Task OnEncodingError(string jobId, string error);
}

public class ProgressHub : Hub<IProgressHubClient>
{
    private readonly IEncodingService _encodingService;

    public ProgressHub(IEncodingService encodingService)
    {
        _encodingService = encodingService;
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();

        // Subscribe to encoding progress updates
        _encodingService.OnProgressUpdated += OnProgressUpdated;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _encodingService.OnProgressUpdated -= OnProgressUpdated;
        await base.OnDisconnectedAsync(exception);
    }

    public async Task<StartEncodingResponseDto> StartEncoding(StartEncodingRequestDto request)
    {
        var response = await _encodingService.StartEncodingAsync(request);

        if (response.Success)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, response.JobId);
        }

        return response;
    }

    public async Task<EncodingProgressDto?> GetProgress(string jobId)
    {
        return await _encodingService.GetProgressAsync(jobId);
    }

    public async Task CancelEncoding(string jobId)
    {
        await _encodingService.CancelEncodingAsync(jobId);
    }

    public async Task SubscribeToJob(string jobId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, jobId);
    }

    public async Task UnsubscribeFromJob(string jobId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, jobId);
    }

    private async void OnProgressUpdated(object? sender, EncodingProgressDto progress)
    {
        await Clients.Group(progress.JobId).OnEncodingProgress(progress);

        if (progress.State == Domain.Enums.EncodingState.Completed ||
            progress.State == Domain.Enums.EncodingState.Failed ||
            progress.State == Domain.Enums.EncodingState.Cancelled)
        {
            // Also broadcast completion to all clients in the job group
            var response = new EncodingCompleteResponseDto(
                JobId: progress.JobId,
                OutputPath: string.Empty,
                FileSize: progress.OutputFileSize ?? 0,
                Duration: progress.CompletedAt.HasValue
                    ? (long)(progress.CompletedAt.Value - progress.StartedAt).TotalMilliseconds
                    : 0,
                Success: progress.State == Domain.Enums.EncodingState.Completed,
                Error: progress.Error
            );

            await Clients.Group(progress.JobId).OnEncodingComplete(response);
        }
    }
}
