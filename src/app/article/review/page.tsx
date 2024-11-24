"use client";

import { useEffect, useState } from "react";

import ContentGeneration from "@/components/review/content-generation";
import OutlineDisplay from "@/components/review/outline-display";
import ReferencesSection from "@/components/review/references-section";
import { paperDatabase } from "@/data/paper-database";
import { sampleOutlines } from "@/data/sample-outlines";
import { getContentForSection } from "@/data/section-content";
import { getContent, saveContent } from "@/lib/actions/user-content";
import type { ContentMetadata } from "@/lib/user-content";

interface ContentState {
  content: string;
  metadata: ContentMetadata;
}

interface DatabaseMetadata {
  id: string;
  userId: string;
  contentType: string;
  filename: string;
  s3Key: string;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  metadata: {
    lastEditedSection?: string;
    wordCount?: number;
    isPublic?: boolean;
    customFields?: Record<string, unknown>;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const createDefaultMetadata = (section: string): ContentMetadata => ({
  title: section,
  lastEditedSection: section,
  wordCount: 0,
  isPublic: false,
});

const convertDatabaseMetadata = (
  dbMetadata: DatabaseMetadata
): ContentMetadata => {
  return {
    title: dbMetadata.title || undefined,
    description: dbMetadata.description || undefined,
    tags: dbMetadata.tags || undefined,
    lastEditedSection: dbMetadata.metadata?.lastEditedSection,
    wordCount: dbMetadata.metadata?.wordCount || 0,
    isPublic: dbMetadata.metadata?.isPublic || false,
    customFields: dbMetadata.metadata?.customFields,
  };
};

export default function ReviewArticle() {
  const [selectedSection, setSelectedSection] = useState(
    "Definition of AI in healthcare"
  );
  const [contentState, setContentState] = useState<ContentState>({
    content: "",
    metadata: createDefaultMetadata(selectedSection),
  });

  // Use the first sample outline
  const currentOutline = sampleOutlines[0];

  // Get content and papers for selected section
  const sectionData = getContentForSection(selectedSection);
  const relevantPaperIds = sectionData?.paperIds || [];

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
  };

  // Filter papers to show only those relevant to the selected section
  const relevantPapers = paperDatabase.filter((paper) =>
    relevantPaperIds.includes(paper.id)
  );

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const result = await getContent("markdown", `${selectedSection}.md`);
        if (result) {
          const metadata = convertDatabaseMetadata(result.metadata);
          setContentState({
            content: result.content || "",
            metadata: {
              ...metadata,
              title: selectedSection,
              lastEditedSection: selectedSection,
              wordCount: result.content?.split(/\s+/).length || 0,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        // Reset to default state for new sections
        setContentState({
          content: "",
          metadata: createDefaultMetadata(selectedSection),
        });
      }
    };

    fetchContent();
  }, [selectedSection]);

  const handleContentChange = (newContent: string) => {
    setContentState((prev) => ({
      content: newContent,
      metadata: {
        ...prev.metadata,
        wordCount: newContent.split(/\s+/).length,
        lastEditedSection: selectedSection,
      },
    }));
  };

  const handleSaveContent = async () => {
    try {
      const success = await saveContent(
        "markdown",
        contentState.content,
        contentState.metadata,
        `${selectedSection}.md`
      );
      if (success) {
        console.log("Content saved successfully");
      } else {
        console.error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column - Outline */}
        <OutlineDisplay
          outline={currentOutline}
          onSectionSelect={handleSectionSelect}
          selectedSection={selectedSection}
        />

        {/* Right Column - Content and References */}
        <div className="space-y-6">
          <ContentGeneration
            selectedSection={selectedSection}
            markdownContent={contentState.content}
            setMarkdownContent={handleContentChange}
          />
          <ReferencesSection
            papers={relevantPapers}
            selectedPapers={relevantPaperIds}
            onPaperSelect={() => {}} // Papers are now automatically selected based on section
          />
          <div className="flex items-center justify-between">
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={handleSaveContent}
            >
              Save Content
            </button>
            <div className="text-sm text-gray-500">
              Words: {contentState.metadata.wordCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
