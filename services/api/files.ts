/**
 * Files API
 * Endpoints for uploading and managing files
 */

import { apiRequest, uploadFile as apiUploadFile } from './client';

// Types
export interface FileUpload {
    id: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    url: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
    created_at: string;
}

export interface PresignedUrlResponse {
    upload_url: string;
    file_id: string;
    expires_in: number;
}

/**
 * Upload a file directly
 */
export async function uploadFile(file: {
    uri: string;
    type: string;
    name: string;
}): Promise<FileUpload> {
    return apiUploadFile<FileUpload>('/files/upload', file);
}

/**
 * Get a presigned URL for direct upload to S3/R2
 */
export async function getPresignedUrl(data: {
    filename: string;
    mime_type: string;
    size_bytes: number;
}): Promise<PresignedUrlResponse> {
    return apiRequest<PresignedUrlResponse>('/files/presigned-url', {
        method: 'POST',
        body: data,
    });
}

/**
 * Upload directly to presigned URL
 */
export async function uploadToPresignedUrl(
    presignedUrl: string,
    file: {
        uri: string;
        type: string;
    }
): Promise<void> {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
            'Content-Type': file.type,
        },
    });
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<void> {
    await apiRequest<void>(`/files/${fileId}`, {
        method: 'DELETE',
    });
}

/**
 * Get file info
 */
export async function getFile(fileId: string): Promise<FileUpload> {
    return apiRequest<FileUpload>(`/files/${fileId}`);
}
