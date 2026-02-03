/**
 * API Services Index
 * Centralized export for all API services
 */

// Re-export client (except uploadFile to avoid naming conflict)
export { apiRequest, streamRequest, APIError } from './client';
export type { HTTPMethod, RequestConfig } from './client';

// Re-export all other services
export * from './auth';
export * from './conversations';
export * from './users';

// Re-export files module with explicit exports to avoid uploadFile conflict
export { uploadFile, getPresignedUrl, uploadToPresignedUrl, deleteFile, getFile } from './files';
export type { FileUpload, PresignedUrlResponse } from './files';

// Export commonly used types
export type { User, AuthResponse, LoginCredentials, RegisterData } from './auth';
export type { Conversation, Message, SendMessageRequest } from './conversations';
export type { UserSettings } from './users';
