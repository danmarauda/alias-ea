/**
 * App Constants
 * Centralized constants for the application
 */

// Design Tokens
export const DESIGN_TOKENS = {
    // Spacing
    SPACING: {
        XS: 4,
        SM: 8,
        MD: 12,
        LG: 16, // global spacing
        XL: 20,
        XXL: 24,
        XXXL: 32,
    },

    // Border Radius
    RADIUS: {
        NONE: 0,
        XS: 4,
        SM: 8,
        MD: 12,
        LG: 16,
        XL: 20,
        XXL: 24,
        FULL: 9999,
    },

    // Icon Sizes (standardized)
    ICON: {
        XS: 16,
        SM: 20,
        MD: 24,
        LG: 32,
        XL: 48,
    },

    // Animation Durations
    ANIMATION: {
        FAST: 150,
        NORMAL: 250,
        SLOW: 350,
        VERY_SLOW: 500,
    },

    // Touch Targets
    TOUCH: {
        MIN: 44, // iOS minimum
        RECOMMENDED: 48, // Material Design guideline
    },

    // Font Sizes
    FONT: {
        XS: 12,
        SM: 14,
        BASE: 16,
        LG: 18,
        XL: 20,
        XXL: 24,
        XXXL: 32,
        HUGE: 40,
    },
} as const;

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    STREAM_TIMEOUT: 120000, // 2 minutes for AI streaming
} as const;

// Pagination
export const PAGINATION = {
    CONVERSATIONS_LIMIT: 20,
    MESSAGES_LIMIT: 50,
    SEARCH_LIMIT: 10,
} as const;

// File Upload Limits
export const FILE_LIMITS = {
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_AUDIO_SIZE: 25 * 1024 * 1024, // 25MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_AUDIO_TYPES: ['audio/mp4', 'audio/m4a', 'audio/wav', 'audio/mpeg'],
} as const;

// Image Optimization
export const IMAGE_CONFIG = {
    COMPRESSION_QUALITY: 0.8,
    THUMBNAIL_SIZE: 200,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
} as const;

// Voice Agent
export const VOICE_CONFIG = {
    DEFAULT_ROOM_PREFIX: 'alias',
    TOKEN_EXPIRY: 3600, // 1 hour
    MAX_SESSION_DURATION: 1800, // 30 minutes
} as const;

// AI Provider Limits
export const AI_LIMITS = {
    MAX_TOKENS: {
        openai: 4096,
        gemini: 8192,
        claude: 4096,
    },
    DEFAULT_TEMPERATURE: 0.7,
    DEFAULT_MAX_TOKENS: 1000,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection and try again.',
    AUTH_FAILED: 'Authentication failed. Please log in again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NOT_FOUND: 'Requested resource not found.',
    VALIDATION: 'Please check your input and try again.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    FILE_TOO_LARGE: 'File is too large. Maximum size is {maxSize}MB.',
    UNSUPPORTED_FILE: 'Unsupported file type. Please choose a different file.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Successfully logged in',
    LOGOUT: 'Successfully logged out',
    REGISTER: 'Account created successfully',
    UPDATE_PROFILE: 'Profile updated successfully',
    DELETE_CONVERSATION: 'Conversation deleted',
    MESSAGE_COPIED: 'Message copied to clipboard',
    FILE_UPLOADED: 'File uploaded successfully',
} as const;
