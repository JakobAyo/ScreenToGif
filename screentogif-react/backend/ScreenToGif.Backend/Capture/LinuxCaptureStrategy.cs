using System.Runtime.InteropServices;
using ScreenToGif.Backend.DTOs.Capture;
using ScreenToGif.Backend.DTOs.Frame;

namespace ScreenToGif.Backend.Capture;

/// <summary>
/// Linux screen capture strategy using PipeWire.
/// </summary>
public class LinuxCaptureStrategy : BaseCaptureStrategy
{
    public override bool IsSupported => RuntimeInformation.IsOSPlatform(OSPlatform.Linux);
    public override string PlatformName => "Linux";

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

        // TODO: Initialize PipeWire screen capture
        // pw_main_loop_new, pw_context_new, etc.

        return Task.CompletedTask;
    }

    public override Task<FrameDto?> CaptureFrameAsync(int frameIndex)
    {
        if (!IsInitialized || CancellationSource?.IsCancellationRequested == true)
        {
            return Task.FromResult<FrameDto?>(null);
        }

        var metadata = CreateFrameMetadata(frameIndex);

        // TODO: Implement actual PipeWire frame capture
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
        // TODO: Enumerate displays using X11 or Wayland
        // For Wayland: org.freedesktop.portal.ScreenCast
        // For X11: XRRGetScreenResources
        yield return new DisplayInfoDto(
            Id: "display-0",
            Name: "Primary Display",
            X: 0,
            Y: 0,
            Width: 1920,
            Height: 1080,
            IsPrimary: true,
            ScaleFactor: 1.0
        );
    }

    public override IEnumerable<WindowInfoDto> GetWindows()
    {
        // TODO: Enumerate windows using X11 or Wayland protocols
        yield break;
    }
}
