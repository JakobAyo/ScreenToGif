using Microsoft.AspNetCore.Mvc;
using ScreenToGif.Backend.DTOs.Capture;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CaptureController : ControllerBase
{
    private readonly ICaptureService _captureService;

    public CaptureController(ICaptureService captureService)
    {
        _captureService = captureService;
    }

    [HttpGet("displays")]
    public async Task<ActionResult<IEnumerable<DisplayInfoDto>>> GetDisplays()
    {
        var displays = await _captureService.GetDisplaysAsync();
        return Ok(displays);
    }

    [HttpGet("windows")]
    public async Task<ActionResult<IEnumerable<WindowInfoDto>>> GetWindows()
    {
        var windows = await _captureService.GetWindowsAsync();
        return Ok(windows);
    }

    [HttpPost("start")]
    public async Task<ActionResult<StartCaptureResponseDto>> StartCapture([FromBody] CaptureOptionsDto options)
    {
        var response = await _captureService.StartCaptureAsync(options);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("stop/{sessionId}")]
    public async Task<ActionResult<StopCaptureResponseDto>> StopCapture(string sessionId)
    {
        var response = await _captureService.StopCaptureAsync(sessionId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("session/{sessionId}")]
    public async Task<ActionResult<CaptureSessionDto>> GetSession(string sessionId)
    {
        var session = await _captureService.GetSessionAsync(sessionId);
        return session != null ? Ok(session) : NotFound();
    }

    [HttpPost("pause/{sessionId}")]
    public async Task<IActionResult> PauseCapture(string sessionId)
    {
        await _captureService.PauseCaptureAsync(sessionId);
        return Ok();
    }

    [HttpPost("resume/{sessionId}")]
    public async Task<IActionResult> ResumeCapture(string sessionId)
    {
        await _captureService.ResumeCaptureAsync(sessionId);
        return Ok();
    }
}
