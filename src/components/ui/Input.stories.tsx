import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { cn } from '@/lib/utils';

const meta = {
  title: 'Basic Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['text', 'password', 'email', 'number', 'search'],
      control: { type: 'select' },
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email address...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled input',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="with-label" className="text-sm font-medium">Email</label>
      <Input id="with-label" placeholder="Enter your email" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="with-error" className="text-sm font-medium">Username</label>
      <Input id="with-error" className="border-red-500" />
      <p className="text-xs text-red-500">This username is already taken</p>
    </div>
  ),
};

export const InputStyles: Story = {
  render: () => (
    <div className="flex flex-col space-y-8 max-w-[650px]">
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Standard App Input:</h3>
        <Input placeholder="Standard form input" />
      </div>
      
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Login Form Input:</h3>
        <Input
          type="email"
          placeholder="Email"
          className={cn(
            "h-14 bg-white text-lg",
            "border-4 border-black rounded-xl",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            "hover:translate-x-[-2px] hover:translate-y-[-2px]",
            "focus:translate-x-[-2px] focus:translate-y-[-2px]",
            "transition-all placeholder:text-black/50"
          )}
        />
      </div>
      
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Mobile Login Input:</h3>
        <Input
          type="email"
          placeholder="EMAIL"
          className={cn(
            "h-10 bg-white text-sm",
            "border-3 border-black rounded-lg",
            "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
            "placeholder:text-black/60 px-2",
            "font-bold"
          )}
        />
      </div>
      
      <div>
        <h3 className="mb-2 font-medium text-gray-500">Register Form Dark Input:</h3>
        <div className="p-6 bg-gray-900 rounded-lg">
          <Input
            type="text"
            placeholder="Display Name"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <h3 className="mb-2 font-medium text-gray-500">Input Style Usage Guide:</h3>
          <ul className="list-disc pl-5 text-sm">
            <li><strong>Standard Input</strong>: For dashboard, settings, and admin pages</li>
            <li><strong>Stylized Login Input</strong>: For the login page</li>
            <li><strong>Mobile Login Input</strong>: For mobile login screens</li>
            <li><strong>Dark Register Input</strong>: For registration flow on dark backgrounds</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};