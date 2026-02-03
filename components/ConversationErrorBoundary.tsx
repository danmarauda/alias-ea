import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Button } from './Button';
import ThemedText from './ThemedText';
import Icon from './Icon';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Specialized ErrorBoundary for the Conversation component.
 * Provides conversation-specific error recovery options.
 */
export class ConversationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Conversation ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Icon name="MessageCircleWarning" size={48} color="#F59E0B" />
          </View>
          
          <ThemedText style={styles.title} className="text-lg font-bold text-center">
            Couldn't load conversation
          </ThemedText>
          
          <ThemedText style={styles.message} className="text-subtext text-center text-sm">
            There was an error displaying your messages. This might be due to corrupted data.
          </ThemedText>

          <View style={styles.buttonContainer}>
            <Button
              title="Try Again"
              onPress={this.handleReset}
              variant="primary"
              size="medium"
              rounded="full"
              className="mb-3"
            />
            
            <Button
              title="Clear & Restart"
              onPress={() => {
                this.handleReset();
                // Trigger a full conversation reset
                if (this.props.onReset) {
                  this.props.onReset();
                }
              }}
              variant="ghost"
              size="small"
            />
          </View>

          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <ThemedText style={styles.errorText} className="text-xs">
                {this.state.error.toString()}
              </ThemedText>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
  },
  errorDetails: {
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(254, 226, 226, 0.5)',
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
  },
});

export default ConversationErrorBoundary;
