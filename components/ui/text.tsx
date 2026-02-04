import * as Slot from '@rn-primitives/slot';
import React, { useContext } from 'react';
import { Text as RNText } from 'react-native';
import { cn } from '@/lib/utils';

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
}) {
  const textClass = useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn('text-foreground text-base web:select-text', textClass, className)}
      {...props}
    />
  );
}

export { Text, TextClassContext };
