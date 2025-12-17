import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Sidebar, type SidebarItem } from './Sidebar';
import { Icon } from '../atoms/Icon';

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: SidebarItem[] = [
  { id: 'recorder', label: 'Recorder', icon: 'record' },
  { id: 'editor', label: 'Editor', icon: 'pencil-square' },
  { id: 'options', label: 'Options', icon: 'cog' },
];

const editorItems: SidebarItem[] = [
  { id: 'frames', label: 'Frames', icon: 'film', badge: 42 },
  { id: 'edit', label: 'Edit', icon: 'pencil-square' },
  { id: 'image', label: 'Image', icon: 'photo' },
  { id: 'transitions', label: 'Transitions', icon: 'adjustments-horizontal' },
  { id: 'text', label: 'Text', icon: 'type' },
  { id: 'drawings', label: 'Drawings', icon: 'paint-brush' },
  { id: 'effects', label: 'Effects', icon: 'cog' },
];

const nestedItems: SidebarItem[] = [
  { id: 'home', label: 'Home', icon: 'folder' },
  {
    id: 'capture',
    label: 'Capture',
    icon: 'record',
    items: [
      { id: 'screen', label: 'Screen', icon: 'photo' },
      { id: 'webcam', label: 'Webcam', icon: 'eye' },
      { id: 'board', label: 'Board', icon: 'pencil-square' },
    ],
  },
  {
    id: 'edit-menu',
    label: 'Edit',
    icon: 'pencil-square',
    items: [
      { id: 'frames-menu', label: 'Frames', icon: 'film' },
      { id: 'text-menu', label: 'Text', icon: 'type' },
      { id: 'drawings-menu', label: 'Drawings', icon: 'paint-brush' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: 'cog' },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    activeItem: 'recorder',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const EditorSidebar: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('frames');

    return (
      <div style={{ height: '500px' }}>
        <Sidebar
          items={editorItems}
          activeItem={activeItem}
          onItemClick={(item) => setActiveItem(item.id)}
          header={
            <div className="flex items-center gap-2">
              <Icon name="gif" className="text-primary-500" />
              <span className="font-semibold text-surface-100">Editor</span>
            </div>
          }
        />
      </div>
    );
  },
};

export const Collapsible: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState('frames');

    return (
      <div style={{ height: '500px', display: 'flex' }}>
        <Sidebar
          items={editorItems}
          activeItem={activeItem}
          onItemClick={(item) => setActiveItem(item.id)}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          header={
            !collapsed && (
              <span className="font-semibold text-surface-100">ScreenToGif</span>
            )
          }
        />
        <div className="flex-1 p-4 bg-surface-950">
          <p className="text-surface-300">
            Click the collapse button at the bottom of the sidebar.
          </p>
        </div>
      </div>
    );
  },
};

export const WithNestedItems: Story = {
  args: {
    items: nestedItems,
    activeItem: 'home',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithFooter: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('recorder');

    return (
      <div style={{ height: '500px' }}>
        <Sidebar
          items={defaultItems}
          activeItem={activeItem}
          onItemClick={(item) => setActiveItem(item.id)}
          header={
            <div className="flex items-center gap-2">
              <Icon name="record" className="text-accent-error" />
              <span className="font-semibold text-surface-100">ScreenToGif</span>
            </div>
          }
          footer={
            <div className="text-xs text-surface-500 text-center">
              v3.0.0
            </div>
          }
        />
      </div>
    );
  },
};

export const WithBadges: Story = {
  args: {
    items: [
      { id: 'inbox', label: 'Inbox', icon: 'folder', badge: 12 },
      { id: 'drafts', label: 'Drafts', icon: 'document', badge: 3 },
      { id: 'sent', label: 'Sent', icon: 'upload' },
      { id: 'trash', label: 'Trash', icon: 'trash' },
    ],
    activeItem: 'inbox',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const DisabledItems: Story = {
  args: {
    items: [
      { id: 'recorder', label: 'Recorder', icon: 'record' },
      { id: 'editor', label: 'Editor', icon: 'pencil-square', disabled: true },
      { id: 'export', label: 'Export', icon: 'download', disabled: true },
      { id: 'options', label: 'Options', icon: 'cog' },
    ],
    activeItem: 'recorder',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};
