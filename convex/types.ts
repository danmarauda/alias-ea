/**
 * Convex types and utilities for the Luna app
 * Shared types for frontend/backend type safety
 */

import type { Id } from "./_generated/dataModel";

export type { Id, Doc, TableNames, DataModel } from "./_generated/dataModel";
export type { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
export type { api, internal } from "./_generated/api";

/**
 * User document type from the users table
 */
export type User = {
  _id: Id<"users">;
  _creationTime: number;
  tokenIdentifier: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
};

/**
 * WorkOS JWT token structure
 */
export interface WorkOSToken {
  access_token: string;
  token_type: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

/**
 * WorkOS user profile from JWT
 */
export interface WorkOSProfile {
  sub: string; // User ID from WorkOS
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}
