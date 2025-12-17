using ScreenToGif.Backend.DTOs.Capture;

namespace ScreenToGif.Backend.Services.Interfaces;

public interface ICaptureService
{
    Task<IEnumerable<DisplayInfoDto>> GetDisplaysAsync();
    Task<IEnumerable<WindowInfoDto>> GetWindowsAsync();
    Task<StartCaptureResponseDto> StartCaptureAsync(CaptureOptionsDto options);
    Task<StopCaptureResponseDto> StopCaptureAsync(string sessionId);
    Task<CaptureSessionDto?> GetSessionAsync(string sessionId);
    Task PauseCaptureAsync(string sessionId);
    Task ResumeCaptureAsync(string sessionId);
}
