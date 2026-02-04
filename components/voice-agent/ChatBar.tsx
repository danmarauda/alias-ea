/**
 * Chat Bar Component
 * 
 * Input component for sending text messages during voice conversation.
 * Supports hybrid voice + text interaction.
 * 
 * Reference: agent-starter-react-native/app/assistant/ui/ChatBar.tsx
 */

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Send } from 'lucide-react-native';

type ChatBarProps = {
  style?: StyleProp<ViewStyle>;
  value: string;
  onChangeText: (text: string) => void;
  onChatSend: (text: string) => void;
};

export default function ChatBar({
  style,
  value,
  onChangeText,
  onChatSend,
}: ChatBarProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[style]}
      keyboardVerticalOffset={24}
    >
      <View style={styles.container}>
        <TextInput
          style={[styles.input]}
          value={value}
          placeholder={'Type a message...'}
          placeholderTextColor={'#666666'}
          onChangeText={onChangeText}
          multiline={true}
          onSubmitEditing={() => value.trim() && onChatSend(value)}
        />
        <TouchableOpacity
          style={[styles.button, !value.trim() && styles.buttonDisabled]}
          activeOpacity={0.7}
          onPress={() => value.trim() && onChatSend(value)}
          disabled={!value.trim()}
        >
          <Send size={20} color={value.trim() ? '#FFFFFF' : '#666666'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#131313',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
  },
  input: {
    outlineStyle: undefined,
    flexGrow: 1,
    marginStart: 8,
    marginEnd: 16,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#666666',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
