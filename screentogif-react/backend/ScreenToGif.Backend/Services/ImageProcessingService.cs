using ScreenToGif.Backend.DTOs.ImageProcessing;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Services;

public class ImageProcessingService : IImageProcessingService
{
    private readonly IProjectService _projectService;

    public ImageProcessingService(IProjectService projectService)
    {
        _projectService = projectService;
    }

    public async Task<ProcessingResultDto> ResizeAsync(string projectId, ResizeOptionsDto options)
    {
        var project = await _projectService.GetProjectAsync(projectId);
        if (project == null)
        {
            return new ProcessingResultDto(false, 0, "Project not found");
        }

        // TODO: Implement actual resize logic
        // - Load each frame
        // - Resize using specified interpolation
        // - Save back

        return new ProcessingResultDto(true, project.FrameCount);
    }

    public async Task<ProcessingResultDto> CropAsync(string projectId, CropOptionsDto options)
    {
        var project = await _projectService.GetProjectAsync(projectId);
        if (project == null)
        {
            return new ProcessingResultDto(false, 0, "Project not found");
        }

        // TODO: Implement actual crop logic
        // - Load each frame
        // - Crop to specified region
        // - Save back

        return new ProcessingResultDto(true, project.FrameCount);
    }

    public async Task<ProcessingResultDto> ApplyFilterAsync(string projectId, FilterOptionsDto options)
    {
        var project = await _projectService.GetProjectAsync(projectId);
        if (project == null)
        {
            return new ProcessingResultDto(false, 0, "Project not found");
        }

        // TODO: Implement filter application
        // Supported filters: grayscale, sepia, invert, blur, sharpen, etc.

        return new ProcessingResultDto(true, project.FrameCount);
    }

    public Task<byte[]> QuantizeAsync(byte[] imageData, int colorCount)
    {
        // TODO: Implement quantization algorithms from legacy code
        // - MedianCut
        // - Octree
        // - NeuQuant
        // - Wu

        // For now, return the input unchanged
        return Task.FromResult(imageData);
    }

    public async Task<FrameEditResultDto> EditFramesAsync(string projectId, FrameEditRequestDto request)
    {
        var project = await _projectService.GetProjectAsync(projectId);
        if (project == null)
        {
            return new FrameEditResultDto(false, new List<string>(), 0, "Project not found");
        }

        var affectedIds = new List<string>();

        switch (request.Operation)
        {
            case Domain.Enums.FrameEditOperation.Delete:
                // TODO: Mark frames as deleted
                affectedIds.AddRange(request.FrameIds);
                break;

            case Domain.Enums.FrameEditOperation.Duplicate:
                // TODO: Duplicate selected frames
                affectedIds.AddRange(request.FrameIds);
                break;

            case Domain.Enums.FrameEditOperation.Reverse:
                // TODO: Reverse frame order
                affectedIds.AddRange(request.FrameIds);
                break;

            case Domain.Enums.FrameEditOperation.Yoyo:
                // TODO: Create yoyo effect (forward then reverse)
                affectedIds.AddRange(request.FrameIds);
                break;

            case Domain.Enums.FrameEditOperation.Reduce:
                // TODO: Remove every Nth frame
                var reduceBy = request.Options?.ReduceBy ?? 2;
                affectedIds.AddRange(request.FrameIds);
                break;

            case Domain.Enums.FrameEditOperation.MoveUp:
            case Domain.Enums.FrameEditOperation.MoveDown:
                // TODO: Reorder frames
                affectedIds.AddRange(request.FrameIds);
                break;
        }

        return new FrameEditResultDto(true, affectedIds, project.FrameCount, null);
    }
}
