import { auth } from "../auth";
import {
  type ContentMetadata,
  type ContentType,
  deleteUserContent,
  getDownloadUrl,
  getUserContent,
  listUserContent,
  saveUserContent,
  updateContentMetadata,
} from "../user-content";

export async function saveContent(
  contentType: ContentType,
  content: string,
  metadata?: ContentMetadata,
  filename?: string
) {
  const user = await auth();
  if (!user?.email) {
    throw new Error("Authentication required");
  }

  const userId = user.email;
  return await saveUserContent(
    userId,
    contentType,
    content,
    metadata,
    filename
  );
}

export async function getContent(contentType: ContentType, filename: string) {
  const user = await auth();
  if (!user?.email) {
    throw new Error("Authentication required");
  }

  const userId = user.email;
  return await getUserContent(userId, contentType, filename);
}

export async function listContent(contentType?: ContentType) {
  const user = await auth();
  if (!user?.email) {
    throw new Error("Authentication required");
  }

  const userId = user.email;
  return await listUserContent(userId, contentType);
}

export async function deleteContent(
  contentType: ContentType,
  filename: string
) {
  const user = await auth();
  if (!user?.email) {
    throw new Error("Authentication required");
  }

  const userId = user.email;
  return await deleteUserContent(userId, contentType, filename);
}

export async function getContentDownloadUrl(
  contentType: ContentType,
  filename: string
) {
  const user = await auth();
  if (!user?.email) {
    throw new Error("Authentication required");
  }

  const userId = user.email;
  return await getDownloadUrl(userId, contentType, filename);
}

export async function updateContent(
  contentType: ContentType,
  filename: string,
  metadata: Partial<ContentMetadata>
) {
  const user = await auth();
  if (!user?.email) {
    throw new Error("Authentication required");
  }

  const userId = user.email;
  return await updateContentMetadata(userId, contentType, filename, metadata);
}
