import { Music4 } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Music4 className="h-6 w-6" />
      <span className="text-xl font-bold">Velvet Metal</span>
    </div>
  );
};
