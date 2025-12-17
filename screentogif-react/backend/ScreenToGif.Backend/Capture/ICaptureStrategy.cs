using ScreenToGif.Backend.DTOs.Capture;
using ScreenToGif.Backend.DTOs.Frame;

namespace ScreenToGif.Backend.Capture;

public interface ICaptureStrategy : IDisposable
{
    bool IsSupported { get; }
    string PlatformName { get; }

    Task InitializeAsync(CaptureOptionsDto options);
    Task<FrameDto?> CaptureFrameAsync(int frameIndex);
    Task<FrameDto?> CaptureFrameWithCursorAsync(int frameIndex);
    Task StopAsync();

    IEnumerable<DisplayInfoDto> GetDisplays();
    IEnumerable<WindowInfoDto> GetWindows();
}
