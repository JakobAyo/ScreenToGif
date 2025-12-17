using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Domain.Enums;

namespace ScreenToGif.Backend.Encoding;

/// <summary>
/// GIF encoder using .NET System.Drawing/ImageSharp.
/// Fallback encoder with basic functionality.
/// </summary>
public class SystemGifEncoder : BaseEncoder
{
    public override string Name => "System";
    public override bool IsAvailable => true;

    private readonly List<(FrameDto frame, byte[] data)> _frames = new();

    public override Task AddFrameAsync(FrameDto frame, byte[] imageData)
    {
        _frames.Add((frame, imageData));
        ProcessedFrames++;
        ReportProgress(EncodingState.Encoding, $"Processing frame {ProcessedFrames}");
        return Task.CompletedTask;
    }

    public override async Task<EncodingCompleteResponseDto> FinalizeAsync()
    {
        ReportProgress(EncodingState.Encoding, "Building GIF...");

        // TODO: Implement using ImageSharp or System.Drawing
        // For now, delegate to the built-in encoder
        var gifEncoder = new GifEncoder();
        await gifEncoder.InitializeAsync(Options!);

        foreach (var (frame, data) in _frames)
        {
            await gifEncoder.AddFrameAsync(frame, data);
        }

        var result = await gifEncoder.FinalizeAsync();

        ReportProgress(EncodingState.Completed, "Encoding complete");

        return result;
    }
}
