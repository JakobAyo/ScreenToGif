using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Services;

public class FrameService : IFrameService
{
    private readonly IProjectService _projectService;

    public FrameService(IProjectService projectService)
    {
        _projectService = projectService;
    }

    public async Task<FrameBatchDto> GetFrameBatchAsync(string sessionId, int startIndex, int count)
    {
        // TODO: Load frames from project/session storage
        var frames = new List<FrameDto>();

        // Return placeholder batch
        return new FrameBatchDto(
            SessionId: sessionId,
            StartIndex: startIndex,
            Frames: frames,
            TotalFrames: 0,
            HasMore: false
        );
    }

    public Task<FrameDto?> GetFrameAsync(string frameId)
    {
        // TODO: Load specific frame by ID
        return Task.FromResult<FrameDto?>(null);
    }

    public Task DeleteFrameAsync(string frameId)
    {
        // TODO: Mark frame as deleted
        return Task.CompletedTask;
    }

    public Task<IEnumerable<string>> GetFrameIdsAsync(string sessionId)
    {
        // TODO: Return all frame IDs for a session
        return Task.FromResult<IEnumerable<string>>(Array.Empty<string>());
    }
}
