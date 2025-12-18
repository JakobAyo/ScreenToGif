import { useMemo } from 'react';

export interface ColorPalettePreviewProps {
  colorCount: number;
  className?: string;
}

export function ColorPalettePreview({
  colorCount,
  className = '',
}: ColorPalettePreviewProps) {
  // Generate a preview color palette based on color count
  const colors = useMemo(() => {
    const palette: string[] = [];
    const hueStep = 360 / Math.min(colorCount, 64);

    for (let i = 0; i < Math.min(colorCount, 64); i++) {
      const hue = (i * hueStep) % 360;
      const saturation = 70 + (i % 3) * 10;
      const lightness = 40 + (i % 4) * 10;
      palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return palette;
  }, [colorCount]);

  const gridCols = Math.min(16, Math.ceil(Math.sqrt(colorCount)));

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-surface-200">Color Palette Preview</span>
        <span className="text-xs text-surface-400">{colorCount} colors</span>
      </div>

      <div
        className="p-2 bg-surface-800 rounded-lg border border-surface-700"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: '2px',
        }}
      >
        {colors.map((color, index) => (
          <div
            key={index}
            className="aspect-square rounded-sm"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {colorCount > 64 && (
        <p className="mt-1.5 text-xs text-surface-500">
          Showing first 64 of {colorCount} colors
        </p>
      )}
    </div>
  );
}
