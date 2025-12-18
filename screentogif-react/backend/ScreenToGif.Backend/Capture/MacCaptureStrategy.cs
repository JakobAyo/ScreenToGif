using System.Runtime.InteropServices;
using ScreenToGif.Backend.DTOs.Capture;
using ScreenToGif.Backend.DTOs.Frame;

namespace ScreenToGif.Backend.Capture;

/// <summary>
/// macOS screen capture strategy using ScreenCaptureKit.
/// </summary>
public class MacCaptureStrategy : BaseCaptureStrategy
{
    public override bool IsSupported => RuntimeInformation.IsOSPlatform(OSPlatform.OSX);
    public override string PlatformName => "macOS";

    protected override Task OnInitializeAsync(CaptureOptionsDto options)
    {
        if (options.Region != null)
        {
            FrameWidth = options.Region.Width;
            FrameHeight = options.Region.Height;
        }
        else
        {
            var primaryDisplay = GetDisplays().FirstOrDefault(d => d.IsPrimary);
            if (primaryDisplay != null)
            {
                FrameWidth = primaryDisplay.Width;
                FrameHeight = primaryDisplay.Height;
            }
            else
            {
                FrameWidth = 1920;
                FrameHeight = 1080;
            }
        }

        // TODO: Initialize ScreenCaptureKit
        // SCContentFilter, SCStreamConfiguration, etc.

        return Task.CompletedTask;
    }

    public override Task<FrameDto?> CaptureFrameAsync(int frameIndex)
    {
        if (!IsInitialized || CancellationSource?.IsCancellationRequested == true)
        {
            return Task.FromResult<FrameDto?>(null);
        }

        var metadata = CreateFrameMetadata(frameIndex);

        // TODO: Implement actual ScreenCaptureKit frame capture
        var frame = new FrameDto(
            Id: Guid.NewGuid().ToString(),
            Metadata: metadata,
            ImageDataUrl: null,
            ThumbnailUrl: null,
            FilePath: null,
            IsKeyFrame: frameIndex == 0,
            IsSelected: false,
            IsDeleted: false
        );

        return Task.FromResult<FrameDto?>(frame);
    }

    public override IEnumerable<DisplayInfoDto> GetDisplays()
    {
        // TODO: Enumerate displays using CGDisplayList
        yield return new DisplayInfoDto(
            Id: "display-0",
            Name: "Primary Display",
            X: 0,
            Y: 0,
            Width: 1920,
            Height: 1080,
            IsPrimary: true,
            ScaleFactor: 2.0 // Retina default
        );
    }

    public override IEnumerable<WindowInfoDto> GetWindows()
    {
        // TODO: Enumerate windows using CGWindowListCopyWindowInfo
        yield break;
    }
}
