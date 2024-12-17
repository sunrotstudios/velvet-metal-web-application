// Add missing type declarations
declare module 'react-day-picker';
declare module 'node-cron';

// Add any other missing type declarations here
declare module '@radix-ui/react-icons' {
  export const ChevronLeftIcon: React.ComponentType<any>;
  export const ChevronRightIcon: React.ComponentType<any>;
  export const DotsHorizontalIcon: React.ComponentType<any>;
  export const CheckIcon: React.ComponentType<any>;
  export const ChevronDownIcon: React.ComponentType<any>;
  export const ChevronUpIcon: React.ComponentType<any>;
  export const CaretSortIcon: React.ComponentType<any>;
  export const DotFilledIcon: React.ComponentType<any>;
}

// Add any global types
declare global {
  interface Window {
    MusicKit: any;
  }
}
