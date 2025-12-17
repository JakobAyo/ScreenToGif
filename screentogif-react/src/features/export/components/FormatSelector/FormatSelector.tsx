import { useState } from 'react';
import { Tabs, type Tab } from '../../../../components/molecules/Tabs';
import { FormatCard } from './FormatCard';
import type { OutputFormat } from '../../../../api/types';
import type { IconName } from '../../../../components/atoms/Icon';

export type FormatCategory = 'animated' | 'video' | 'image';

export interface FormatOption {
  id: OutputFormat;
  name: string;
  description: string;
  icon: IconName;
  category: FormatCategory;
  recommended?: boolean;
}

export interface FormatSelectorProps {
  selectedFormat: OutputFormat | null;
  onFormatChange: (format: OutputFormat) => void;
  disabled?: boolean;
  className?: string;
}

const formatOptions: FormatOption[] = [
  // Animated formats
  {
    id: 'gif',
    name: 'GIF',
    description: 'Widely supported animated format',
    icon: 'gif',
    category: 'animated',
    recommended: true,
  },
  {
    id: 'apng',
    name: 'APNG',
    description: 'Animated PNG with full color',
    icon: 'photo',
    category: 'animated',
  },
  {
    id: 'webp',
    name: 'WebP',
    description: 'Modern format for web',
    icon: 'photo',
    category: 'animated',
  },
  // Video formats
  {
    id: 'mp4',
    name: 'MP4',
    description: 'H.264/H.265 video codec',
    icon: 'film',
    category: 'video',
    recommended: true,
  },
  {
    id: 'webm',
    name: 'WebM',
    description: 'VP8/VP9 codec for web',
    icon: 'film',
    category: 'video',
  },
  {
    id: 'avi',
    name: 'AVI',
    description: 'Legacy video format',
    icon: 'film',
    category: 'video',
  },
  // Image formats
  {
    id: 'png',
    name: 'PNG',
    description: 'Lossless image format',
    icon: 'photo',
    category: 'image',
    recommended: true,
  },
  {
    id: 'jpg',
    name: 'JPEG',
    description: 'Compressed image format',
    icon: 'photo',
    category: 'image',
  },
];

const categoryTabs: Tab[] = [
  { id: 'animated', label: 'Animated' },
  { id: 'video', label: 'Video' },
  { id: 'image', label: 'Image' },
];

export function FormatSelector({
  selectedFormat,
  onFormatChange,
  disabled = false,
  className = '',
}: FormatSelectorProps) {
  const selectedOption = formatOptions.find((f) => f.id === selectedFormat);
  const initialCategory = selectedOption?.category || 'animated';
  const [activeCategory, setActiveCategory] = useState<FormatCategory>(initialCategory);

  const filteredFormats = formatOptions.filter((f) => f.category === activeCategory);

  return (
    <div className={className}>
      <Tabs
        tabs={categoryTabs}
        activeTab={activeCategory}
        onChange={(id) => setActiveCategory(id as FormatCategory)}
        variant="pills"
        size="sm"
      />

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredFormats.map((format) => (
          <FormatCard
            key={format.id}
            id={format.id}
            name={format.name}
            description={format.description}
            icon={format.icon}
            selected={selectedFormat === format.id}
            disabled={disabled}
            onClick={() => onFormatChange(format.id)}
            badge={
              format.recommended ? (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-accent-success/20 text-accent-success rounded">
                  Recommended
                </span>
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
