using System.Collections.Concurrent;
using ScreenToGif.Backend.DTOs.Capture;
using ScreenToGif.Backend.DTOs.Frame;

namespace ScreenToGif.Backend.Capture;

public abstract class BaseCaptureStrategy : ICaptureStrategy
{
    protected CaptureOptionsDto? Options;
    protected BlockingCollection<FrameDto> FrameQueue = new(100);
    protected CancellationTokenSource? CancellationSource;
    protected bool IsInitialized;
    protected int FrameWidth;
    protected int FrameHeight;
    protected double Scale = 1.0;
    protected DateTime StartTime;

    public abstract bool IsSupported { get; }
    public abstract string PlatformName { get; }

    public virtual async Task InitializeAsync(CaptureOptionsDto options)
    {
        Options = options;
        CancellationSource = new CancellationTokenSource();
        StartTime = DateTime.UtcNow;

        await OnInitializeAsync(options);
        IsInitialized = true;
    }

    protected abstract Task OnInitializeAsync(CaptureOptionsDto options);

    public abstract Task<FrameDto?> CaptureFrameAsync(int frameIndex);

    public virtual Task<FrameDto?> CaptureFrameWithCursorAsync(int frameIndex)
    {
        return CaptureFrameAsync(frameIndex);
    }

    public virtual async Task StopAsync()
    {
        CancellationSource?.Cancel();
        FrameQueue.CompleteAdding();
        await OnStopAsync();
        IsInitialized = false;
    }

    protected virtual Task OnStopAsync() => Task.CompletedTask;

    public abstract IEnumerable<DisplayInfoDto> GetDisplays();
    public abstract IEnumerable<WindowInfoDto> GetWindows();

    protected FrameMetadataDto CreateFrameMetadata(int index)
    {
        var timestamp = (long)(DateTime.UtcNow - StartTime).TotalMilliseconds;
        var delay = Options?.FrameRate > 0 ? (int)(1000.0 / Options.FrameRate) : 33;

        return new FrameMetadataDto(
            Index: index,
            Timestamp: timestamp,
            Delay: delay,
            Width: FrameWidth,
            Height: FrameHeight,
            CursorX: null,
            CursorY: null,
            MouseClicked: null,
            KeyPressed: null
        );
    }

    public virtual void Dispose()
    {
        CancellationSource?.Cancel();
        CancellationSource?.Dispose();
        FrameQueue.Dispose();
        GC.SuppressFinalize(this);
    }
}
