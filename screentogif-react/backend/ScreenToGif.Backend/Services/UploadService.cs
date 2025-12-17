using System.Net.Http.Headers;
using System.Text.Json;
using ScreenToGif.Backend.DTOs.Upload;
using ScreenToGif.Backend.Services.Interfaces;

namespace ScreenToGif.Backend.Services;

public class UploadService : IUploadService
{
    private readonly HttpClient _httpClient;

    public UploadService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<UploadResponseDto> UploadToImgurAsync(string filePath, string? clientId = null)
    {
        if (!File.Exists(filePath))
        {
            return new UploadResponseDto(false, null, null, "File not found");
        }

        try
        {
            var fileBytes = await File.ReadAllBytesAsync(filePath);
            var base64 = Convert.ToBase64String(fileBytes);

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.imgur.com/3/image");
            request.Headers.Authorization = new AuthenticationHeaderValue("Client-ID", clientId ?? "YOUR_CLIENT_ID");

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("image", base64),
                new KeyValuePair<string, string>("type", "base64")
            });

            request.Content = content;

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var data = result.GetProperty("data");
                var link = data.GetProperty("link").GetString();
                var deleteHash = data.GetProperty("deletehash").GetString();

                return new UploadResponseDto(true, link, deleteHash);
            }

            return new UploadResponseDto(false, null, null, $"Upload failed: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            return new UploadResponseDto(false, null, null, ex.Message);
        }
    }

    public async Task<UploadResponseDto> UploadToYandexDiskAsync(string filePath, string accessToken)
    {
        if (!File.Exists(filePath))
        {
            return new UploadResponseDto(false, null, null, "File not found");
        }

        try
        {
            var fileName = Path.GetFileName(filePath);

            // Get upload URL
            using var getUrlRequest = new HttpRequestMessage(HttpMethod.Get,
                $"https://cloud-api.yandex.net/v1/disk/resources/upload?path=app:/{fileName}&overwrite=true");
            getUrlRequest.Headers.Authorization = new AuthenticationHeaderValue("OAuth", accessToken);

            var getUrlResponse = await _httpClient.SendAsync(getUrlRequest);
            var getUrlContent = await getUrlResponse.Content.ReadAsStringAsync();

            if (!getUrlResponse.IsSuccessStatusCode)
            {
                return new UploadResponseDto(false, null, null, $"Failed to get upload URL: {getUrlResponse.StatusCode}");
            }

            var urlResult = JsonSerializer.Deserialize<JsonElement>(getUrlContent);
            var uploadUrl = urlResult.GetProperty("href").GetString();

            if (string.IsNullOrEmpty(uploadUrl))
            {
                return new UploadResponseDto(false, null, null, "Failed to get upload URL");
            }

            // Upload file
            var fileBytes = await File.ReadAllBytesAsync(filePath);
            using var uploadRequest = new HttpRequestMessage(HttpMethod.Put, uploadUrl);
            uploadRequest.Content = new ByteArrayContent(fileBytes);

            var uploadResponse = await _httpClient.SendAsync(uploadRequest);

            if (uploadResponse.IsSuccessStatusCode || uploadResponse.StatusCode == System.Net.HttpStatusCode.Created)
            {
                return new UploadResponseDto(true, $"https://disk.yandex.com/client/disk/{fileName}", null);
            }

            return new UploadResponseDto(false, null, null, $"Upload failed: {uploadResponse.StatusCode}");
        }
        catch (Exception ex)
        {
            return new UploadResponseDto(false, null, null, ex.Message);
        }
    }
}
