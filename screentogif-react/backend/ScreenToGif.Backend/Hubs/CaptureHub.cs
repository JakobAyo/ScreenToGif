using Microsoft.AspNetCore.SignalR;
using ScreenToGif.Backend.DTOs.Capture;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Hubs;

public interface ICaptureHubClient
{
    Task OnFrameCaptured(FrameDto frame);
    Task OnCaptureStateChanged(CaptureSessionDto session);
    Task OnCaptureError(string error);
}

public class CaptureHub : Hub<ICaptureHubClient>
{
    private readonly ICaptureService _captureService;

    public CaptureHub(ICaptureService captureService)
    {
        _captureService = captureService;
    }

    public async Task<IEnumerable<DisplayInfoDto>> GetDisplays()
    {
        return await _captureService.GetDisplaysAsync();
    }

    public async Task<IEnumerable<WindowInfoDto>> GetWindows()
    {
        return await _captureService.GetWindowsAsync();
    }

    public async Task<StartCaptureResponseDto> StartCapture(CaptureOptionsDto options)
    {
        var response = await _captureService.StartCaptureAsync(options);

        if (response.Success)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, response.SessionId);
        }

        return response;
    }

    public async Task<StopCaptureResponseDto> StopCapture(string sessionId)
    {
        var response = await _captureService.StopCaptureAsync(sessionId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
        return response;
    }

    public async Task<CaptureSessionDto?> GetSession(string sessionId)
    {
        return await _captureService.GetSessionAsync(sessionId);
    }

    public async Task PauseCapture(string sessionId)
    {
        await _captureService.PauseCaptureAsync(sessionId);
        var session = await _captureService.GetSessionAsync(sessionId);
        if (session != null)
        {
            await Clients.Group(sessionId).OnCaptureStateChanged(session);
        }
    }

    public async Task ResumeCapture(string sessionId)
    {
        await _captureService.ResumeCaptureAsync(sessionId);
        var session = await _captureService.GetSessionAsync(sessionId);
        if (session != null)
        {
            await Clients.Group(sessionId).OnCaptureStateChanged(session);
        }
    }

    public async Task SubscribeToSession(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
    }

    public async Task UnsubscribeFromSession(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
    }
}
