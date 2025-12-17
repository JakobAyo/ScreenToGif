import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, IconSolid, type IconName } from './Icon';

const allIcons: IconName[] = [
  'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
  'arrow-left', 'arrow-right',
  'play', 'pause', 'stop', 'record', 'skip-back', 'skip-forward',
  'close', 'plus', 'minus', 'check', 'x-mark', 'menu', 'dots-vertical', 'dots-horizontal',
  'folder', 'document', 'download', 'upload', 'trash',
  'photo', 'film', 'gif',
  'cog', 'adjustments-horizontal',
  'check-circle', 'x-circle', 'exclamation-circle', 'information-circle',
  'crop', 'pencil-square', 'paint-brush', 'cursor', 'hand', 'type', 'undo', 'redo', 'zoom-in', 'zoom-out',
  'eye', 'eye-slash', 'sun', 'moon', 'clock', 'question',
];

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: allIcons,
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'play',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="play" size="xs" />
      <Icon name="play" size="sm" />
      <Icon name="play" size="md" />
      <Icon name="play" size="lg" />
      <Icon name="play" size="xl" />
    </div>
  ),
};

export const NavigationIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="chevron-left" />
      <Icon name="chevron-right" />
      <Icon name="chevron-up" />
      <Icon name="chevron-down" />
      <Icon name="arrow-left" />
      <Icon name="arrow-right" />
    </div>
  ),
};

export const MediaIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="play" />
      <Icon name="pause" />
      <Icon name="stop" />
      <Icon name="record" />
      <Icon name="skip-back" />
      <Icon name="skip-forward" />
    </div>
  ),
};

export const ActionIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="close" />
      <Icon name="plus" />
      <Icon name="minus" />
      <Icon name="check" />
      <Icon name="menu" />
      <Icon name="trash" />
    </div>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="check-circle" className="text-accent-success" />
      <Icon name="x-circle" className="text-accent-error" />
      <Icon name="exclamation-circle" className="text-accent-warning" />
      <Icon name="information-circle" className="text-accent-info" />
    </div>
  ),
};

export const EditorIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="crop" />
      <Icon name="pencil-square" />
      <Icon name="paint-brush" />
      <Icon name="cursor" />
      <Icon name="type" />
      <Icon name="undo" />
      <Icon name="redo" />
      <Icon name="zoom-in" />
      <Icon name="zoom-out" />
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-4">
      {allIcons.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2 p-2">
          <Icon name={name} size="md" />
          <span className="text-2xs text-surface-400 text-center">{name}</span>
        </div>
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export const SolidVariant: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconSolid name="play" className="text-primary-500" />
      <IconSolid name="check-circle" className="text-accent-success" />
      <IconSolid name="x-circle" className="text-accent-error" />
    </div>
  ),
};

export const WithColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="play" className="text-primary-500" />
      <Icon name="check" className="text-accent-success" />
      <Icon name="close" className="text-accent-error" />
      <Icon name="exclamation-circle" className="text-accent-warning" />
      <Icon name="information-circle" className="text-accent-info" />
    </div>
  ),
};
