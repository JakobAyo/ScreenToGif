import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { Icon } from './Icon';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'filled'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'name@example.com',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    helperText: 'Must be at least 3 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: true,
    errorMessage: 'Password must be at least 8 characters',
    defaultValue: 'short',
  },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: <Icon name="zoom-in" size="sm" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Enter amount',
    rightIcon: <span className="text-surface-400 text-sm">USD</span>,
  },
};

export const FilledVariant: Story = {
  args: {
    variant: 'filled',
    placeholder: 'Filled input',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Disabled input',
  },
};

export const SearchInput: Story = {
  args: {
    placeholder: 'Search frames...',
    leftIcon: <Icon name="zoom-in" size="sm" />,
    type: 'search',
  },
};
