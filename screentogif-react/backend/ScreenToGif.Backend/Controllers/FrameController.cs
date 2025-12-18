using Microsoft.AspNetCore.Mvc;
using ScreenToGif.Backend.DTOs.Frame;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FrameController : ControllerBase
{
    private readonly IFrameService _frameService;

    public FrameController(IFrameService frameService)
    {
        _frameService = frameService;
    }

    [HttpGet("batch/{sessionId}")]
    public async Task<ActionResult<FrameBatchDto>> GetFrameBatch(
        string sessionId,
        [FromQuery] int startIndex = 0,
        [FromQuery] int count = 50)
    {
        var batch = await _frameService.GetFrameBatchAsync(sessionId, startIndex, count);
        return Ok(batch);
    }

    [HttpGet("{frameId}")]
    public async Task<ActionResult<FrameDto>> GetFrame(string frameId)
    {
        var frame = await _frameService.GetFrameAsync(frameId);
        return frame != null ? Ok(frame) : NotFound();
    }

    [HttpDelete("{frameId}")]
    public async Task<IActionResult> DeleteFrame(string frameId)
    {
        await _frameService.DeleteFrameAsync(frameId);
        return NoContent();
    }

    [HttpGet("session/{sessionId}/ids")]
    public async Task<ActionResult<IEnumerable<string>>> GetFrameIds(string sessionId)
    {
        var ids = await _frameService.GetFrameIdsAsync(sessionId);
        return Ok(ids);
    }
}
