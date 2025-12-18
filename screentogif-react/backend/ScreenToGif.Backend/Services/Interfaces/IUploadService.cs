using ScreenToGif.Backend.DTOs.Upload;

namespace ScreenToGif.Backend.Services.Interfaces;

public interface IUploadService
{
    Task<UploadResponseDto> UploadToImgurAsync(string filePath, string? clientId = null);
    Task<UploadResponseDto> UploadToYandexDiskAsync(string filePath, string accessToken);
}
