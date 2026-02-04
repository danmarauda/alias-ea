import { forwardRef } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  className?: string;
}

const Button = forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  (
    { children, variant = 'primary', size = 'md', disabled, loading, onPress, className, ...props },
    ref
  ) => {
    const baseStyles = 'items-center justify-center rounded-lg';

    const variants = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      destructive: 'bg-destructive',
      outline: 'border border-border bg-transparent',
      ghost: 'bg-transparent',
    };

    const sizes = {
      sm: { minHeight: 40, paddingVertical: 8, paddingHorizontal: 12 },
      md: { minHeight: 50, paddingVertical: 12, paddingHorizontal: 16 },
      lg: { minHeight: 56, paddingVertical: 16, paddingHorizontal: 20 },
    };

    const textColors = {
      primary: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
    };

    const textSizes = {
      sm: { fontSize: 14, fontWeight: '600' as const },
      md: { fontSize: 16, fontWeight: '600' as const },
      lg: { fontSize: 18, fontWeight: '600' as const },
    };

    const isDisabled = disabled || loading;

    return (
      <TouchableOpacity
        ref={ref}
        className={cn(baseStyles, variants[variant], isDisabled && 'opacity-50', className)}
        style={sizes[size]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        {...props}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'destructive' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'}
          />
        ) : typeof children === 'string' ? (
          <Text className={textColors[variant]} style={textSizes[size]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

export { Button };
