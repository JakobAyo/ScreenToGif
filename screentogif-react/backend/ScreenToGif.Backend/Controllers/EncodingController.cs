using Microsoft.AspNetCore.Mvc;
using ScreenToGif.Backend.DTOs.Encoding;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EncodingController : ControllerBase
{
    private readonly IEncodingService _encodingService;

    public EncodingController(IEncodingService encodingService)
    {
        _encodingService = encodingService;
    }

    [HttpPost("start")]
    public async Task<ActionResult<StartEncodingResponseDto>> StartEncoding([FromBody] StartEncodingRequestDto request)
    {
        var response = await _encodingService.StartEncodingAsync(request);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("job/{jobId}")]
    public async Task<ActionResult<EncodingProgressDto>> GetProgress(string jobId)
    {
        var progress = await _encodingService.GetProgressAsync(jobId);
        return progress != null ? Ok(progress) : NotFound();
    }

    [HttpPost("cancel/{jobId}")]
    public async Task<IActionResult> CancelEncoding(string jobId)
    {
        await _encodingService.CancelEncodingAsync(jobId);
        return Ok();
    }

    [HttpGet("job/{jobId}/status")]
    public async Task<ActionResult<EncodingProgressDto>> GetJobStatus(string jobId)
    {
        var progress = await _encodingService.GetProgressAsync(jobId);
        return progress != null ? Ok(progress) : NotFound();
    }
}
