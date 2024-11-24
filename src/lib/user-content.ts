"use server";

import { and, ilike } from "drizzle-orm";

import { db } from "@/db";
import { userContent } from "@/db/schema";

import {
  deleteFromS3,
  getFromS3,
  getSignedDownloadUrl,
  uploadToS3,
} from "./s3";

export type ContentType = "outline" | "article" | "references" | "markdown";

export interface ContentMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  lastEditedSection?: string;
  wordCount?: number;
  isPublic?: boolean;
  customFields?: Record<string, unknown>;
}

export const saveUserContent = async (
  userId: string,
  contentType: ContentType,
  content: string,
  metadata?: ContentMetadata,
  filename?: string
) => {
  const key = generateKey(userId, contentType, filename);
  const success = await uploadToS3(key, content);
  if (success) {
    await saveContentMetadata(userId, contentType, filename, key, metadata);
  }
  return success;
};

export const getUserContent = async (
  userId: string,
  contentType: ContentType,
  filename: string
) => {
  const key = generateKey(userId, contentType, filename);
  const content = await getFromS3(key);
  const metadata = await getContentMetadata(userId, contentType, filename);
  return { content, metadata };
};

export const listUserContent = async (
  userId: string,
  contentType?: ContentType
) => {
  const conditions = [ilike(userContent.userId, userId)];

  if (contentType) {
    conditions.push(ilike(userContent.contentType, contentType));
  }

  return await db
    .select()
    .from(userContent)
    .where(and(...conditions))
    .orderBy(userContent.updatedAt);
};

export const deleteUserContent = async (
  userId: string,
  contentType: ContentType,
  filename: string
) => {
  const key = generateKey(userId, contentType, filename);
  const success = await deleteFromS3(key);
  if (success) {
    await deleteContentMetadata(userId, contentType, filename);
  }
  return success;
};

export const getDownloadUrl = async (
  userId: string,
  contentType: ContentType,
  filename: string
) => {
  const key = generateKey(userId, contentType, filename);
  return await getSignedDownloadUrl(key);
};

export const updateContentMetadata = async (
  userId: string,
  contentType: ContentType,
  filename: string,
  metadata: Partial<ContentMetadata>
) => {
  await db
    .update(userContent)
    .set({
      ...metadata,
      updatedAt: new Date(),
    })
    .where(
      and(
        ilike(userContent.userId, userId),
        ilike(userContent.contentType, contentType),
        ilike(userContent.filename, filename)
      )
    );
};

const generateKey = (
  userId: string,
  contentType: ContentType,
  filename?: string
) => {
  const safeName = filename
    ? encodeURIComponent(filename.replace(/[^a-zA-Z0-9-_.]/g, "-"))
    : `${Date.now()}.md`;
  return `${userId}/${contentType}/${safeName}`;
};

const saveContentMetadata = async (
  userId: string,
  contentType: ContentType,
  filename: string | undefined,
  s3Key: string,
  metadata?: ContentMetadata
) => {
  const finalFilename = filename || `${Date.now()}.md`;
  await db.insert(userContent).values({
    userId,
    contentType,
    filename: finalFilename,
    s3Key,
    title: metadata?.title,
    description: metadata?.description,
    tags: metadata?.tags,
    metadata: {
      lastEditedSection: metadata?.lastEditedSection,
      wordCount: metadata?.wordCount,
      isPublic: metadata?.isPublic,
      customFields: metadata?.customFields,
    },
  });
};

const getContentMetadata = async (
  userId: string,
  contentType: ContentType,
  filename: string
) => {
  return await db
    .select()
    .from(userContent)
    .where(
      and(
        ilike(userContent.userId, userId),
        ilike(userContent.contentType, contentType),
        ilike(userContent.filename, filename)
      )
    )
    .limit(1)
    .then((results) => results[0]);
};

const deleteContentMetadata = async (
  userId: string,
  contentType: ContentType,
  filename: string
) => {
  await db
    .delete(userContent)
    .where(
      and(
        ilike(userContent.userId, userId),
        ilike(userContent.contentType, contentType),
        ilike(userContent.filename, filename)
      )
    );
};
