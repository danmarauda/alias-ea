import * as TabsPrimitive from '@rn-primitives/tabs';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { TextClassContext } from './text';

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & {
  ref?: React.RefObject<TabsPrimitive.ListRef>;
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        'native:h-12 bg-muted native:px-1.5 h-10 items-center justify-center rounded-md p-1 web:inline-flex',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TriggerProps & {
  ref?: React.RefObject<TabsPrimitive.TriggerRef>;
}) {
  const { value } = TabsPrimitive.useRootContext();
  return (
    <TextClassContext.Provider
      value={cn(
        'text-sm native:text-base font-medium text-muted-foreground web:transition-all',
        value === props.value && 'text-foreground'
      )}>
      <TabsPrimitive.Trigger
        className={cn(
          'web:ring-offset-background web:focus-visible:ring-ring inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium shadow-none web:whitespace-nowrap web:transition-all web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-offset-2',
          props.disabled && 'opacity-50 web:pointer-events-none',
          props.value === value && 'bg-background shadow-foreground/10 shadow-lg',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & {
  ref?: React.RefObject<TabsPrimitive.ContentRef>;
}) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'web:ring-offset-background web:focus-visible:ring-ring web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
