using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.DTOs.Frame;

namespace ScreenToGif.Backend.Encoding;

public interface IEncoder : IDisposable
{
    string Name { get; }
    bool IsAvailable { get; }

    Task InitializeAsync(EncodingOptionsDto options);
    Task AddFrameAsync(FrameDto frame, byte[] imageData);
    Task<EncodingCompleteResponseDto> FinalizeAsync();

    event EventHandler<EncodingProgressDto>? OnProgress;
}
