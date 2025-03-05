import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { StylizedButton } from '../landing/DesignElements';

const meta = {
  title: 'Basic Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'noShadow', 'neutral', 'reverse'],
      control: { type: 'select' },
    },
    size: {
      options: ['default', 'sm', 'lg', 'icon'],
      control: { type: 'select' },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button',
    variant: 'default',
    size: 'default',
  },
};

export const NoShadow: Story = {
  args: {
    children: 'No Shadow Button',
    variant: 'noShadow',
    size: 'default',
  },
};

export const Neutral: Story = {
  args: {
    children: 'Neutral Button',
    variant: 'neutral',
    size: 'default',
  },
};

export const Reverse: Story = {
  args: {
    children: 'Reverse Button',
    variant: 'reverse',
    size: 'default',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'default',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'default',
    size: 'lg',
  },
};

export const IconButton: Story = {
  args: {
    children: '👍',
    variant: 'default',
    size: 'icon',
  },
};

export const ButtonComparison: Story = {
  render: () => (
    <div className="flex flex-col space-y-6">
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Standard UI Button:</h3>
        <Button>Standard Button</Button>
      </div>
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Landing Page Button:</h3>
        <StylizedButton>Landing Button</StylizedButton>
      </div>
      <div className="space-y-2">
        <div>
          <h3 className="mb-2 font-medium text-gray-500">When to use which button:</h3>
          <ul className="list-disc pl-5 text-sm">
            <li><strong>Standard UI Button</strong>: For dashboard, functional pages, and utility actions</li>
            <li><strong>Landing Page Button</strong>: For marketing pages, CTAs, and public-facing visuals</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};