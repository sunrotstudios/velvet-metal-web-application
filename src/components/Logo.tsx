import blackLogo from '../../public/black-logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-32',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={blackLogo}
        alt="Velvet Metal"
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
};
