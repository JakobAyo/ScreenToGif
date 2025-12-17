import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import type { VideoCodec } from '../../../../api/types';

export interface CodecSelectorProps {
  value: VideoCodec;
  onChange: (value: VideoCodec) => void;
  format?: 'mp4' | 'webm' | 'avi';
  disabled?: boolean;
  className?: string;
}

const mp4Codecs: DropdownOption<VideoCodec>[] = [
  {
    value: 'h264',
    label: 'H.264',
    description: 'Best compatibility',
  },
  {
    value: 'h265',
    label: 'H.265 (HEVC)',
    description: 'Better compression, newer devices',
  },
  {
    value: 'av1',
    label: 'AV1',
    description: 'Best quality, limited support',
  },
];

const webmCodecs: DropdownOption<VideoCodec>[] = [
  {
    value: 'vp8',
    label: 'VP8',
    description: 'Good compatibility',
  },
  {
    value: 'vp9',
    label: 'VP9',
    description: 'Better compression',
  },
  {
    value: 'av1',
    label: 'AV1',
    description: 'Best quality, limited support',
  },
];

const aviCodecs: DropdownOption<VideoCodec>[] = [
  {
    value: 'h264',
    label: 'H.264',
    description: 'Best compatibility',
  },
];

const codecOptions: Record<string, DropdownOption<VideoCodec>[]> = {
  mp4: mp4Codecs,
  webm: webmCodecs,
  avi: aviCodecs,
};

export function CodecSelector({
  value,
  onChange,
  format = 'mp4',
  disabled = false,
  className = '',
}: CodecSelectorProps) {
  const options = codecOptions[format] || mp4Codecs;

  return (
    <Dropdown
      label="Video Codec"
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  );
}
