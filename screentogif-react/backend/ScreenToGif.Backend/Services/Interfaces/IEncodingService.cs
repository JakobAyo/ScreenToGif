using ScreenToGif.Backend.DTOs.Encoding;

namespace ScreenToGif.Backend.Services.Interfaces;

public interface IEncodingService
{
    Task<StartEncodingResponseDto> StartEncodingAsync(StartEncodingRequestDto request);
    Task<EncodingProgressDto?> GetProgressAsync(string jobId);
    Task CancelEncodingAsync(string jobId);
    event EventHandler<EncodingProgressDto>? OnProgressUpdated;
}
