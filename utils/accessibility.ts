/**
 * Accessibility Utilities
 * Constants and helpers for improving app accessibility
 */

import { AccessibilityRole } from 'react-native';

// Accessibility Roles
export const A11Y_ROLES = {
    BUTTON: 'button' as AccessibilityRole,
    LINK: 'link' as AccessibilityRole,
    TEXT: 'text' as AccessibilityRole,
    HEADER: 'header' as AccessibilityRole,
    IMAGE: 'image' as AccessibilityRole,
    IMAGE_BUTTON: 'imagebutton' as AccessibilityRole,
    SEARCH: 'search' as AccessibilityRole,
    MENU: 'menu' as AccessibilityRole,
    MENU_ITEM: 'menuitem' as AccessibilityRole,
    ADJUSTABLE: 'adjustable' as AccessibilityRole,
    CHECKBOX: 'checkbox' as AccessibilityRole,
    RADIO: 'radio' as AccessibilityRole,
    SWITCH: 'switch' as AccessibilityRole,
} as const;

// Accessibility States
export interface A11yState {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
}

// Accessibility Labels
export const A11Y_LABELS = {
    // Navigation
    DRAWER_BUTTON: 'Open navigation menu',
    BACK_BUTTON: 'Go back',
    CLOSE_BUTTON: 'Close',
    
    // Chat
    SEND_MESSAGE: 'Send message',
    ATTACH_FILE: 'Attach file',
    ATTACH_IMAGE: 'Attach image',
    ATTACH_CAMERA: 'Take photo',
    RECORD_AUDIO: 'Record audio message',
    STOP_RECORDING: 'Stop recording',
    LIKE_MESSAGE: 'Like message',
    UNLIKE_MESSAGE: 'Unlike message',
    COPY_MESSAGE: 'Copy message',
    SHARE_MESSAGE: 'Share message',
    SCROLL_TO_BOTTOM: 'Scroll to latest message',
    
    // Forms
    EMAIL_INPUT: 'Email address',
    PASSWORD_INPUT: 'Password',
    CONFIRM_PASSWORD_INPUT: 'Confirm password',
    NAME_INPUT: 'Full name',
    SEARCH_INPUT: 'Search conversations',
    MESSAGE_INPUT: 'Type your message',
    
    // Auth
    LOGIN_BUTTON: 'Log in to your account',
    SIGNUP_BUTTON: 'Create new account',
    LOGOUT_BUTTON: 'Log out',
    GOOGLE_LOGIN: 'Continue with Google',
    APPLE_LOGIN: 'Continue with Apple',
    FORGOT_PASSWORD: 'Forgot password?',
    
    // Profile
    EDIT_PROFILE: 'Edit profile',
    CHANGE_AVATAR: 'Change profile picture',
    
    // Settings
    THEME_TOGGLE: 'Toggle dark mode',
    PROVIDER_SWITCH: 'Switch AI provider',
    
    // Voice
    CONNECT_VOICE: 'Connect to voice agent',
    DISCONNECT_VOICE: 'Disconnect from voice agent',
    MUTE_MIC: 'Mute microphone',
    UNMUTE_MIC: 'Unmute microphone',
} as const;

// Accessibility Hints
export const A11Y_HINTS = {
    // Navigation
    DRAWER_BUTTON: 'Opens the navigation drawer to access other screens',
    
    // Chat
    SEND_MESSAGE: 'Sends your message to the AI assistant',
    ATTACH_FILE: 'Opens file picker to attach a document',
    ATTACH_IMAGE: 'Opens image picker to attach a photo',
    ATTACH_CAMERA: 'Opens camera to take a photo',
    RECORD_AUDIO: 'Hold to record an audio message, will be transcribed automatically',
    LIKE_MESSAGE: 'Marks this message as liked for future reference',
    
    // Forms
    EMAIL_INPUT: 'Enter your email address for authentication',
    PASSWORD_INPUT: 'Enter your password, minimum 6 characters',
    
    // Auth
    LOGIN_BUTTON: 'Submit your credentials to log in',
    GOOGLE_LOGIN: 'Use your Google account to sign in',
    APPLE_LOGIN: 'Use your Apple ID to sign in',
    
    // Voice
    CONNECT_VOICE: 'Starts a voice conversation with ALIAS agent',
    MUTE_MIC: 'Temporarily mutes your microphone',
} as const;

// Touch Target Sizes (44x44 minimum for accessibility)
export const TOUCH_TARGET = {
    MIN_SIZE: 44,
    RECOMMENDED: 48,
} as const;

/**
 * Create accessibility props for a button
 */
export function buttonA11yProps(
    label: string,
    hint?: string,
    state?: A11yState
) {
    return {
        accessible: true,
        accessibilityRole: A11Y_ROLES.BUTTON,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityState: state,
    };
}

/**
 * Create accessibility props for an input
 */
export function inputA11yProps(
    label: string,
    hint?: string,
    required?: boolean
) {
    return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityRequired: required,
    };
}

/**
 * Create accessibility props for an image
 */
export function imageA11yProps(
    description: string,
    isDecorative: boolean = false
) {
    if (isDecorative) {
        return {
            accessible: false,
            accessibilityElementsHidden: true,
        };
    }

    return {
        accessible: true,
        accessibilityRole: A11Y_ROLES.IMAGE,
        accessibilityLabel: description,
    };
}

/**
 * Announce a message to screen readers
 */
export function announceForAccessibility(message: string) {
    if (typeof (globalThis as any).AccessibilityInfo !== 'undefined') {
        (globalThis as any).AccessibilityInfo.announceForAccessibility(message);
    }
}
