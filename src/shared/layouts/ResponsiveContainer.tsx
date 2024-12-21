import { ReactNode } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';

interface ResponsiveContainerProps {
  children: ReactNode;
  breakpoint?: number;
  mobileContent?: ReactNode;
}

export const ResponsiveContainer = ({
  children,
  breakpoint = 768,
  mobileContent
}: ResponsiveContainerProps) => {
  const { width } = useWindowSize();
  const isMobile = width ? width < breakpoint : false;

  return (
    <>
      {isMobile && mobileContent ? mobileContent : children}
    </>
  );
};
