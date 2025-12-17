import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import type { QuantizationMethod } from '../../../../api/types';

export interface QuantizerSelectorProps {
  value: QuantizationMethod;
  onChange: (value: QuantizationMethod) => void;
  disabled?: boolean;
  className?: string;
}

const quantizerOptions: DropdownOption<QuantizationMethod>[] = [
  {
    value: 'medianCut',
    label: 'Median Cut',
    description: 'Good balance of quality and speed',
  },
  {
    value: 'octree',
    label: 'Octree',
    description: 'Fast quantization with good results',
  },
  {
    value: 'neuQuant',
    label: 'Neural Network',
    description: 'Best quality, slower processing',
  },
  {
    value: 'wuQuantizer',
    label: 'Wu Quantizer',
    description: 'High quality color reduction',
  },
];

export function QuantizerSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: QuantizerSelectorProps) {
  return (
    <Dropdown
      label="Quantization Method"
      options={quantizerOptions}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  );
}
