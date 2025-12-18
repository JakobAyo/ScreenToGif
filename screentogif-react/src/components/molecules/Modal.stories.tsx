import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal, ConfirmModal } from './Modal';
import { Button } from '../atoms/Button';

const meta: Meta<typeof Modal> = {
  title: 'Molecules/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const ModalTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalTemplate {...args} />,
  args: {
    title: 'Modal Title',
    children: (
      <div>
        <p className="text-surface-300">
          This is a modal dialog. You can add any content here.
        </p>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  render: (args) => <ModalTemplate {...args} />,
  args: {
    title: 'Save Changes',
    children: (
      <p className="text-surface-300">
        Are you sure you want to save these changes?
      </p>
    ),
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save</Button>
      </>
    ),
  },
};

export const LargeContent: Story = {
  render: (args) => <ModalTemplate {...args} />,
  args: {
    title: 'Export Settings',
    size: 'lg',
    children: (
      <div className="space-y-4">
        <p className="text-surface-300">Configure your export settings below:</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-surface-700 rounded-lg">
            <h4 className="font-medium text-surface-100 mb-2">Format</h4>
            <p className="text-sm text-surface-400">GIF, APNG, WebP, MP4</p>
          </div>
          <div className="p-4 bg-surface-700 rounded-lg">
            <h4 className="font-medium text-surface-100 mb-2">Quality</h4>
            <p className="text-sm text-surface-400">High, Medium, Low</p>
          </div>
          <div className="p-4 bg-surface-700 rounded-lg">
            <h4 className="font-medium text-surface-100 mb-2">Size</h4>
            <p className="text-sm text-surface-400">Original, 50%, 25%</p>
          </div>
          <div className="p-4 bg-surface-700 rounded-lg">
            <h4 className="font-medium text-surface-100 mb-2">Loop</h4>
            <p className="text-sm text-surface-400">Infinite, Once, Custom</p>
          </div>
        </div>
      </div>
    ),
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Export</Button>
      </>
    ),
  },
};

export const NoCloseButton: Story = {
  render: (args) => <ModalTemplate {...args} />,
  args: {
    title: 'Processing',
    showCloseButton: false,
    closeOnEscape: false,
    closeOnOverlayClick: false,
    children: (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        <p className="text-surface-300">Processing your request...</p>
      </div>
    ),
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="flex gap-2">
        {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Button
            key={s}
            variant="secondary"
            onClick={() => {
              setSize(s);
              setIsOpen(true);
            }}
          >
            {s.toUpperCase()}
          </Button>
        ))}
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={`${size.toUpperCase()} Modal`}
          size={size}
        >
          <p className="text-surface-300">
            This is a {size} sized modal dialog.
          </p>
        </Modal>
      </div>
    );
  },
};

// Confirm Modal
export const ConfirmDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            console.log('Confirmed!');
            setIsOpen(false);
          }}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          variant="danger"
          confirmLabel="Delete"
        />
      </>
    );
  },
};
