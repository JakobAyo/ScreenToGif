using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Encoding;

/// <summary>
/// High-quality GIF encoder using gifski library.
/// Produces highest quality GIFs with excellent compression.
/// </summary>
public class GifskiEncoder : BaseEncoder
{
    public override string Name => "Gifski";
    public override bool IsAvailable => CheckGifskiAvailable();

    private string? _tempDirectory;
    private readonly List<string> _framePaths = new();
    private GifEncodingOptionsDto? _gifOptions;

    public override async Task InitializeAsync(EncodingOptionsDto options)
    {
        await base.InitializeAsync(options);
        _gifOptions = options.Gif;
        _tempDirectory = Path.Combine(Path.GetTempPath(), $"stg_gifski_{JobId}");
        Directory.CreateDirectory(_tempDirectory);
    }

    public override async Task AddFrameAsync(FrameDto frame, byte[] imageData)
    {
        if (_tempDirectory == null)
            throw new InvalidOperationException("Encoder not initialized");

        var framePath = Path.Combine(_tempDirectory, $"frame_{ProcessedFrames:D6}.png");
        await File.WriteAllBytesAsync(framePath, imageData);
        _framePaths.Add(framePath);

        ProcessedFrames++;
        ReportProgress(EncodingState.Encoding, $"Processing frame {ProcessedFrames}");
    }

    public override async Task<EncodingCompleteResponseDto> FinalizeAsync()
    {
        if (_tempDirectory == null)
            throw new InvalidOperationException("Encoder not initialized");

        try
        {
            ReportProgress(EncodingState.Encoding, "Encoding with Gifski...");

            // TODO: Implement actual gifski interop
            // For now, fall back to system GIF encoding
            var quality = _gifOptions?.Quality ?? 90;
            var fps = Options?.FrameRate ?? 15;

            // gifski command: gifski -o output.gif --fps 15 --quality 90 frame*.png
            var success = await RunGifskiAsync(quality, fps);

            var fileSize = File.Exists(OutputPath) ? new FileInfo(OutputPath).Length : 0;
            var duration = (long)(DateTime.UtcNow - StartTime).TotalMilliseconds;

            ReportProgress(EncodingState.Completed, "Encoding complete");

            return new EncodingCompleteResponseDto(JobId, OutputPath, fileSize, duration, success);
        }
        finally
        {
            CleanupTempFiles();
        }
    }

    private async Task<bool> RunGifskiAsync(int quality, int fps)
    {
        // TODO: Implement gifski native library integration
        // For now, return false to indicate not implemented
        await Task.CompletedTask;
        return false;
    }

    private void CleanupTempFiles()
    {
        if (_tempDirectory != null && Directory.Exists(_tempDirectory))
        {
            try { Directory.Delete(_tempDirectory, true); } catch { }
        }
    }

    private static bool CheckGifskiAvailable()
    {
        // TODO: Check for gifski library presence
        return false;
    }

    public override void Dispose()
    {
        CleanupTempFiles();
        base.Dispose();
    }
}
