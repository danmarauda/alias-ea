import React from 'react';
import { ScrollView, View, ViewProps } from 'react-native';
import { styled } from 'nativewind';

interface ThemeFooterProps extends ViewProps {
  children: React.ReactNode;
}

const ThemeFooter = styled(View);

export default function ThemedFooter({ children, className, ...props }: ThemeFooterProps) {
  return (
    <ThemeFooter
      className={`bg-light-primary dark:bg-dark-primary px-global pt-global w-full  ${className || ''}`}
      {...props}
    >
      {children}
    </ThemeFooter>
  );
}
