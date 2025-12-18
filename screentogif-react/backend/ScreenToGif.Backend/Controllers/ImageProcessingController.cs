using Microsoft.AspNetCore.Mvc;
using ScreenToGif.Backend.DTOs.ImageProcessing;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageProcessingController : ControllerBase
{
    private readonly IImageProcessingService _imageProcessingService;

    public ImageProcessingController(IImageProcessingService imageProcessingService)
    {
        _imageProcessingService = imageProcessingService;
    }

    [HttpPost("{projectId}/resize")]
    public async Task<ActionResult<ProcessingResultDto>> Resize(string projectId, [FromBody] ResizeOptionsDto options)
    {
        var result = await _imageProcessingService.ResizeAsync(projectId, options);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{projectId}/crop")]
    public async Task<ActionResult<ProcessingResultDto>> Crop(string projectId, [FromBody] CropOptionsDto options)
    {
        var result = await _imageProcessingService.CropAsync(projectId, options);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{projectId}/filter")]
    public async Task<ActionResult<ProcessingResultDto>> ApplyFilter(string projectId, [FromBody] FilterOptionsDto options)
    {
        var result = await _imageProcessingService.ApplyFilterAsync(projectId, options);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{projectId}/frames/edit")]
    public async Task<ActionResult<FrameEditResultDto>> EditFrames(string projectId, [FromBody] FrameEditRequestDto request)
    {
        var result = await _imageProcessingService.EditFramesAsync(projectId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
