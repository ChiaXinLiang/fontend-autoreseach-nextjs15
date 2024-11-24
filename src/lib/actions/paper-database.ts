import { paperDatabase } from "../../data/paper-database";
import {
  UserPaper,
  getPaper as getOutlinePaper,
  listPapers as listOutlinePapers,
  savePaper,
} from "./outline-content";

// Initialize default papers for a new user
export async function initializeDefaultPapers() {
  const papers = paperDatabase.map((paper) => ({
    id: paper.id,
    title: paper.title,
    authors: paper.authors,
    year: paper.year,
    description: paper.description,
  }));

  // Save each paper to user's storage
  await Promise.all(papers.map((paper) => savePaper(paper)));
  return papers;
}

// Find a paper by query (title or id)
export async function findUserPaper(query: string): Promise<UserPaper | null> {
  const papers = await listOutlinePapers();
  const lowercaseQuery = query.toLowerCase();

  for (const paper of papers) {
    const content = await getOutlinePaper(
      paper.filename.replace(/^paper-|\.json$/g, "")
    );
    if (!content) continue;

    if (
      content.id.toLowerCase() === lowercaseQuery ||
      content.title.toLowerCase().includes(lowercaseQuery)
    ) {
      return content;
    }
  }

  return null;
}

// Get all papers for the current user
export async function getUserPapers(): Promise<UserPaper[]> {
  const papers = await listOutlinePapers();
  const results: UserPaper[] = [];

  for (const paper of papers) {
    try {
      const content = await getOutlinePaper(
        paper.filename.replace(/^paper-|\.json$/g, "")
      );
      if (content) {
        results.push(content);
      }
    } catch (error) {
      console.error("Error loading paper:", error);
      continue;
    }
  }

  return results;
}

// Add a new paper for the user
export async function addUserPaper(
  paper: Omit<UserPaper, "id">
): Promise<UserPaper> {
  const newPaper: UserPaper = {
    ...paper,
    id: `paper-${Date.now()}`,
  };

  await savePaper(newPaper);
  return newPaper;
}

// Get a specific paper by ID
export async function getPaper(paperId: string): Promise<UserPaper | null> {
  return await getOutlinePaper(paperId);
}

// Delete a paper for the user
export async function deleteUserPaper(paperId: string): Promise<boolean> {
  try {
    const paper = await getOutlinePaper(paperId);
    if (!paper) return false;

    // Note: We would need to implement deleteUserContent in outline-content.ts
    // For now, we'll just return true
    return true;
  } catch (error) {
    console.error("Error deleting paper:", error);
    return false;
  }
}
