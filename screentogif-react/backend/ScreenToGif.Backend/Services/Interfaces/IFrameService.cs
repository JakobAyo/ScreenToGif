using ScreenToGif.Backend.DTOs.Frame;

namespace ScreenToGif.Backend.Services.Interfaces;

public interface IFrameService
{
    Task<FrameBatchDto> GetFrameBatchAsync(string sessionId, int startIndex, int count);
    Task<FrameDto?> GetFrameAsync(string frameId);
    Task DeleteFrameAsync(string frameId);
    Task<IEnumerable<string>> GetFrameIdsAsync(string sessionId);
}
