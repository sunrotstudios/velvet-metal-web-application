import React from 'react';
import { useGlobals } from '@storybook/preview-api';

export const ThemeDecorator = (Story: React.ComponentType) => {
  const [{ theme }] = useGlobals();
  const currentTheme = theme || 'light';
  
  return (
    <div className={`theme-${currentTheme}`} data-theme={currentTheme}>
      <Story />
    </div>
  );
};