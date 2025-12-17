import { Icon, type IconName } from '../../../../components/atoms/Icon';
import type { EncodingState } from '../../../../api/types';

export interface EncodingStageProps {
  stage: EncodingState;
  label: string;
  isActive?: boolean;
  isComplete?: boolean;
  className?: string;
}

const stageIcons: Record<EncodingState, IconName> = {
  queued: 'clock',
  preparing: 'cog',
  encoding: 'film',
  optimizing: 'adjustments-horizontal',
  completed: 'check-circle',
  failed: 'x-circle',
  cancelled: 'x-mark',
};

export function EncodingStage({
  stage,
  label,
  isActive = false,
  isComplete = false,
  className = '',
}: EncodingStageProps) {
  const icon = stageIcons[stage];

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg
        ${isActive ? 'bg-primary-500/10 border border-primary-500/30' : ''}
        ${isComplete ? 'bg-accent-success/10' : ''}
        ${className}
      `}
    >
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${isActive ? 'bg-primary-500/20 text-primary-400' : ''}
          ${isComplete ? 'bg-accent-success/20 text-accent-success' : ''}
          ${!isActive && !isComplete ? 'bg-surface-700 text-surface-400' : ''}
        `}
      >
        {isActive ? (
          <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon name={icon} size="sm" />
        )}
      </div>

      <div className="flex-1">
        <span
          className={`
            text-sm font-medium
            ${isActive ? 'text-primary-400' : ''}
            ${isComplete ? 'text-accent-success' : ''}
            ${!isActive && !isComplete ? 'text-surface-400' : ''}
          `}
        >
          {label}
        </span>
      </div>

      {isComplete && (
        <Icon name="check" size="sm" className="text-accent-success" />
      )}
    </div>
  );
}

export interface EncodingStagesProps {
  currentStage: EncodingState;
  className?: string;
}

const stages: { state: EncodingState; label: string }[] = [
  { state: 'preparing', label: 'Preparing' },
  { state: 'encoding', label: 'Encoding' },
  { state: 'optimizing', label: 'Optimizing' },
  { state: 'completed', label: 'Complete' },
];

const stageOrder = ['queued', 'preparing', 'encoding', 'optimizing', 'completed'];

export function EncodingStages({ currentStage, className = '' }: EncodingStagesProps) {
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className={`space-y-2 ${className}`}>
      {stages.map((stage, index) => {
        const stageIndex = stageOrder.indexOf(stage.state);
        const isActive = currentStage === stage.state;
        const isComplete = currentIndex > stageIndex;

        return (
          <EncodingStage
            key={stage.state}
            stage={stage.state}
            label={stage.label}
            isActive={isActive}
            isComplete={isComplete}
          />
        );
      })}
    </div>
  );
}
