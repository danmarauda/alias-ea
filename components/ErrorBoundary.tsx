import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Platform } from 'react-native';
import { Button } from './Button';
import ThemedText from './ThemedText';
import Icon from './Icon';
import * as Application from 'expo-application';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error tracking service
    // Example: Sentry, Bugsnag, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.iconContainer}>
              <Icon name="AlertTriangle" size={64} color="#EF4444" />
            </View>
            
            <ThemedText style={styles.title} className="text-2xl font-bold text-center">
              Something went wrong
            </ThemedText>
            
            <ThemedText style={styles.message} className="text-subtext text-center">
              We apologize for the inconvenience. The app encountered an unexpected error.
            </ThemedText>

            <View style={styles.buttonContainer}>
              <Button
                title="Try Again"
                onPress={this.handleReset}
                variant="primary"
                size="large"
                rounded="full"
                className="mb-4"
              />
              
              <Button
                title="Restart App"
                onPress={() => {
                  // In a real app, you might want to use expo-updates to reload
                  this.handleReset();
                }}
                variant="outline"
                size="large"
                rounded="full"
              />
            </View>

            {/* Error details (collapsible in production) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <ThemedText style={styles.errorTitle} className="font-bold mb-2">
                  Error Details (Development Only):
                </ThemedText>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.stackTrace}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            {/* App info */}
            <View style={styles.appInfo}>
              <ThemedText style={styles.appInfoText}>
                Version: {Application.nativeApplicationVersion || '1.0.0'}
              </ThemedText>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  message: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  errorDetails: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    width: '100%',
  },
  errorTitle: {
    color: '#DC2626',
  },
  errorText: {
    color: '#7F1D1D',
    fontSize: 12,
    marginBottom: 8,
  },
  stackTrace: {
    color: '#7F1D1D',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  appInfo: {
    marginTop: 32,
  },
  appInfoText: {
    fontSize: 12,
    opacity: 0.5,
  },
});

// Hook for functional components to catch async errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

export default ErrorBoundary;
