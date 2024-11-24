import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  type ContentMetadata,
  type ContentType,
  deleteUserContent,
  getDownloadUrl,
  getUserContent,
  listUserContent,
  saveUserContent,
  updateContentMetadata,
} from "@/lib/user-content";

export async function saveContent(
  contentType: ContentType,
  content: string,
  metadata?: ContentMetadata,
  filename?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }

  const userId = session.user.email;
  return await saveUserContent(
    userId,
    contentType,
    content,
    metadata,
    filename
  );
}

export async function getContent(contentType: ContentType, filename: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }

  const userId = session.user.email;
  return await getUserContent(userId, contentType, filename);
}

export async function listContent(contentType?: ContentType) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }

  const userId = session.user.email;
  return await listUserContent(userId, contentType);
}

export async function deleteContent(
  contentType: ContentType,
  filename: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }

  const userId = session.user.email;
  return await deleteUserContent(userId, contentType, filename);
}

export async function getContentDownloadUrl(
  contentType: ContentType,
  filename: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }

  const userId = session.user.email;
  return await getDownloadUrl(userId, contentType, filename);
}

export async function updateContent(
  contentType: ContentType,
  filename: string,
  metadata: Partial<ContentMetadata>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }

  const userId = session.user.email;
  return await updateContentMetadata(userId, contentType, filename, metadata);
}
