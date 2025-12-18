import { useState } from 'react';
import { Input } from '../../../../components/atoms/Input';
import { Button } from '../../../../components/atoms/Button';

export interface NamingPatternProps {
  value: string;
  onChange: (pattern: string) => void;
  preview?: string;
  disabled?: boolean;
  className?: string;
}

interface PatternVariable {
  id: string;
  name: string;
  example: string;
  insert: string;
}

const patternVariables: PatternVariable[] = [
  { id: 'date', name: 'Date', example: '2024-01-15', insert: '{date}' },
  { id: 'time', name: 'Time', example: '14-30-00', insert: '{time}' },
  { id: 'datetime', name: 'Date & Time', example: '2024-01-15_14-30-00', insert: '{datetime}' },
  { id: 'project', name: 'Project Name', example: 'MyProject', insert: '{project}' },
  { id: 'counter', name: 'Counter', example: '001', insert: '{counter:D3}' },
];

function generatePreview(pattern: string): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');

  return pattern
    .replace('{date}', date)
    .replace('{time}', time)
    .replace('{datetime}', `${date}_${time}`)
    .replace('{project}', 'Recording')
    .replace(/{counter:D(\d+)}/g, (_, digits) => '1'.padStart(Number(digits), '0'));
}

export function NamingPattern({
  value,
  onChange,
  preview: customPreview,
  disabled = false,
  className = '',
}: NamingPatternProps) {
  const [showVariables, setShowVariables] = useState(false);

  const previewText = customPreview || generatePreview(value || 'export_{datetime}');

  const insertVariable = (variable: PatternVariable) => {
    onChange(value + variable.insert);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-surface-200">
          File Name Pattern
        </label>
        <button
          type="button"
          onClick={() => setShowVariables(!showVariables)}
          className="text-xs text-primary-400 hover:text-primary-300"
          disabled={disabled}
        >
          {showVariables ? 'Hide variables' : 'Show variables'}
        </button>
      </div>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="export_{datetime}"
        disabled={disabled}
      />

      {/* Preview */}
      <div className="mt-2 p-2 bg-surface-800 rounded border border-surface-700">
        <span className="text-xs text-surface-400">Preview: </span>
        <span className="text-xs text-surface-200 font-mono">{previewText}</span>
      </div>

      {/* Variable Buttons */}
      {showVariables && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-surface-400">Click to insert variable:</p>
          <div className="flex flex-wrap gap-2">
            {patternVariables.map((variable) => (
              <Button
                key={variable.id}
                variant="ghost"
                size="sm"
                onClick={() => insertVariable(variable)}
                disabled={disabled}
              >
                <span className="font-mono">{variable.insert}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
