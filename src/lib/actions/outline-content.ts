import { auth } from "../auth";
import {
  ContentMetadata,
  getUserContent,
  listUserContent,
  saveUserContent,
} from "../user-content";

export interface UserPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  description: string;
}

export interface UserOutlineSection {
  title: string;
  subsections: string[];
}

export interface UserOutline {
  title: string;
  sections: UserOutlineSection[];
  papers: UserPaper[];
}

export interface UserSectionContent {
  content: string;
  paperIds: string[];
}

async function getUserId() {
  const user = await auth();
  if (!user?.id) {
    throw new Error("Authentication required");
  }
  return user.id;
}

// Save outline data for a user
export async function saveOutline(outline: UserOutline) {
  const userId = await getUserId();
  const content = JSON.stringify(outline);
  const metadata: ContentMetadata = {
    title: outline.title,
    customFields: {
      paperCount: outline.papers.length,
      sectionCount: outline.sections.length,
    },
  };

  return await saveUserContent(
    userId,
    "outline",
    content,
    metadata,
    `outline-${Date.now()}.json`
  );
}

// Get outline data for a user
export async function getOutline(filename: string) {
  const userId = await getUserId();
  const result = await getUserContent(userId, "outline", filename);

  return result.content ? (JSON.parse(result.content) as UserOutline) : null;
}

// List all outlines for a user
export async function listOutlines() {
  const userId = await getUserId();
  return await listUserContent(userId, "outline");
}

// Save section content for a user
export async function saveSectionContent(
  outlineId: string,
  sectionTitle: string,
  content: UserSectionContent
) {
  const userId = await getUserId();
  const metadata: ContentMetadata = {
    title: sectionTitle,
    customFields: {
      outlineId,
      paperReferenceCount: content.paperIds.length,
    },
  };

  return await saveUserContent(
    userId,
    "article",
    JSON.stringify(content),
    metadata,
    `${outlineId}-${sectionTitle.toLowerCase().replace(/\s+/g, "-")}.json`
  );
}

// Get section content for a user
export async function getSectionContent(
  outlineId: string,
  sectionTitle: string
) {
  const userId = await getUserId();
  const result = await getUserContent(
    userId,
    "article",
    `${outlineId}-${sectionTitle.toLowerCase().replace(/\s+/g, "-")}.json`
  );

  return result.content
    ? (JSON.parse(result.content) as UserSectionContent)
    : null;
}

// Save paper data for a user
export async function savePaper(paper: UserPaper) {
  const userId = await getUserId();
  const metadata: ContentMetadata = {
    title: paper.title,
    customFields: {
      authors: paper.authors,
      year: paper.year,
    },
  };

  return await saveUserContent(
    userId,
    "references",
    JSON.stringify(paper),
    metadata,
    `paper-${paper.id}.json`
  );
}

// Get paper data for a user
export async function getPaper(paperId: string) {
  const userId = await getUserId();
  const result = await getUserContent(
    userId,
    "references",
    `paper-${paperId}.json`
  );

  return result.content ? (JSON.parse(result.content) as UserPaper) : null;
}

// List all papers for a user
export async function listPapers() {
  const userId = await getUserId();
  return await listUserContent(userId, "references");
}
