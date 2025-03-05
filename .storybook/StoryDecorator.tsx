import React from 'react';
import { TooltipProvider } from '../src/components/ui/tooltip';
import { ToastProvider } from '../src/components/ui/toast';

// This decorator wraps all stories with the necessary providers
export const StoryDecorator = (Story: React.ComponentType) => {
  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="p-6">
          <Story />
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
};