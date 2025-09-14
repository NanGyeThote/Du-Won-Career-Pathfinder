import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Container = ({ children, size = 'md', className }: ContainerProps) => {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6',
        size === 'sm' && 'max-w-2xl',
        size === 'md' && 'max-w-4xl lg:px-8',
        size === 'lg' && 'max-w-6xl lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
