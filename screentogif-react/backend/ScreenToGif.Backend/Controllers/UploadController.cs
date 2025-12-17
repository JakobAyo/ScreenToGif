using Microsoft.AspNetCore.Mvc;
using ScreenToGif.Backend.DTOs.Upload;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IUploadService _uploadService;

    public UploadController(IUploadService uploadService)
    {
        _uploadService = uploadService;
    }

    [HttpPost("imgur")]
    public async Task<ActionResult<UploadResponseDto>> UploadToImgur([FromBody] UploadRequestDto request)
    {
        var clientId = request.Credentials?.GetValueOrDefault("clientId");
        var response = await _uploadService.UploadToImgurAsync(request.FilePath, clientId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("yandex")]
    public async Task<ActionResult<UploadResponseDto>> UploadToYandex([FromBody] UploadRequestDto request)
    {
        var accessToken = request.Credentials?.GetValueOrDefault("accessToken");
        if (string.IsNullOrEmpty(accessToken))
        {
            return BadRequest(new UploadResponseDto(false, null, null, "Access token is required"));
        }

        var response = await _uploadService.UploadToYandexDiskAsync(request.FilePath, accessToken);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
