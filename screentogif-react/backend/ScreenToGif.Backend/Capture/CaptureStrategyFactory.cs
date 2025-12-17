using System.Runtime.InteropServices;

namespace ScreenToGif.Backend.Capture;

public interface ICaptureStrategyFactory
{
    ICaptureStrategy CreateStrategy();
}

public class CaptureStrategyFactory : ICaptureStrategyFactory
{
    public ICaptureStrategy CreateStrategy()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return new WindowsCaptureStrategy();
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            return new MacCaptureStrategy();
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            return new LinuxCaptureStrategy();
        }

        throw new PlatformNotSupportedException("Current platform is not supported for screen capture.");
    }
}
