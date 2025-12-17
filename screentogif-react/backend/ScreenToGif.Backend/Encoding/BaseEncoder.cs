using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Encoding;

public abstract class BaseEncoder : IEncoder
{
    protected EncodingOptionsDto? Options;
    protected string JobId = string.Empty;
    protected int TotalFrames;
    protected int ProcessedFrames;
    protected DateTime StartTime;
    protected string OutputPath = string.Empty;
    protected MemoryStream? OutputStream;

    public abstract string Name { get; }
    public abstract bool IsAvailable { get; }

    public event EventHandler<EncodingProgressDto>? OnProgress;

    public virtual Task InitializeAsync(EncodingOptionsDto options)
    {
        Options = options;
        JobId = Guid.NewGuid().ToString();
        OutputPath = options.OutputPath;
        StartTime = DateTime.UtcNow;
        ProcessedFrames = 0;
        OutputStream = new MemoryStream();

        return Task.CompletedTask;
    }

    public abstract Task AddFrameAsync(FrameDto frame, byte[] imageData);

    public abstract Task<EncodingCompleteResponseDto> FinalizeAsync();

    protected void ReportProgress(EncodingState state, string stage, int? currentFrame = null)
    {
        var progress = TotalFrames > 0 ? (double)(currentFrame ?? ProcessedFrames) / TotalFrames * 100 : 0;

        var progressDto = new EncodingProgressDto(
            JobId: JobId,
            State: state,
            Progress: progress,
            CurrentFrame: currentFrame ?? ProcessedFrames,
            TotalFrames: TotalFrames,
            Stage: stage,
            EstimatedTimeRemaining: CalculateEstimatedTime(),
            OutputFileSize: OutputStream?.Length,
            Error: null,
            StartedAt: StartTime,
            CompletedAt: state == EncodingState.Completed ? DateTime.UtcNow : null
        );

        OnProgress?.Invoke(this, progressDto);
    }

    private long? CalculateEstimatedTime()
    {
        if (ProcessedFrames == 0 || TotalFrames == 0)
            return null;

        var elapsed = (DateTime.UtcNow - StartTime).TotalMilliseconds;
        var avgTimePerFrame = elapsed / ProcessedFrames;
        var remainingFrames = TotalFrames - ProcessedFrames;

        return (long)(avgTimePerFrame * remainingFrames);
    }

    protected async Task WriteToFileAsync()
    {
        if (OutputStream == null)
            return;

        OutputStream.Position = 0;
        await using var fileStream = File.Create(OutputPath);
        await OutputStream.CopyToAsync(fileStream);
    }

    public virtual void Dispose()
    {
        OutputStream?.Dispose();
        GC.SuppressFinalize(this);
    }
}
