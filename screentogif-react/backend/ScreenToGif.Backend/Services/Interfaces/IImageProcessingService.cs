using ScreenToGif.Backend.DTOs.ImageProcessing;
using ScreenToGif.Backend.DTOs.Frame;

namespace ScreenToGif.Backend.Services.Interfaces;

public interface IImageProcessingService
{
    Task<ProcessingResultDto> ResizeAsync(string projectId, ResizeOptionsDto options);
    Task<ProcessingResultDto> CropAsync(string projectId, CropOptionsDto options);
    Task<ProcessingResultDto> ApplyFilterAsync(string projectId, FilterOptionsDto options);
    Task<byte[]> QuantizeAsync(byte[] imageData, int colorCount);
    Task<FrameEditResultDto> EditFramesAsync(string projectId, FrameEditRequestDto request);
}
