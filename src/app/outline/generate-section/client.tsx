"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ContentGenerator } from "@/components/content-generator";
import {
  UserOutline,
  UserOutlineSection,
  UserPaper,
  saveOutline,
} from "@/lib/actions/outline-content";
import { getPaper } from "@/lib/actions/paper-database";

export default function GenerateSectionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const paperIds = searchParams.get("papers")?.split(",") || [];

  const [inputText, setInputText] = useState("");
  const [sections, setSections] = useState<UserOutlineSection[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<UserPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load selected papers
  useEffect(() => {
    async function loadPapers() {
      try {
        setIsLoading(true);
        setError(null);

        if (paperIds.length === 0) {
          setError("No papers selected. Please go back and select papers.");
          setIsLoading(false);
          return;
        }

        const papers = await Promise.all(
          paperIds.map(async (id) => {
            const paper = await getPaper(id);
            if (!paper) throw new Error(`Paper ${id} not found`);
            return paper;
          })
        );

        setSelectedPapers(papers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading papers:", error);
        if ((error as Error).message === "Authentication required") {
          router.push("/auth/signin");
        } else {
          setError(
            "Failed to load selected papers. Please go back and try again."
          );
        }
        setIsLoading(false);
      }
    }

    loadPapers();
  }, [paperIds, router]);

  const handleApply = () => {
    try {
      // Parse input text as markdown and extract sections
      const lines = inputText.split("\n");
      const newSections: UserOutlineSection[] = [];
      let currentSection: UserOutlineSection | null = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("# ")) {
          // Main section
          if (currentSection) {
            newSections.push(currentSection);
          }
          currentSection = {
            title: trimmedLine.substring(2),
            subsections: [],
          };
        } else if (trimmedLine.startsWith("## ") && currentSection) {
          // Subsection
          currentSection.subsections.push(trimmedLine.substring(3));
        }
      }

      if (currentSection) {
        newSections.push(currentSection);
      }

      setSections(newSections);
    } catch (error) {
      console.error("Error parsing input text:", error);
      alert(
        "Failed to parse input text. Please check the format and try again."
      );
    }
  };

  const handleDownloadPrompt = () => {
    if (!title || selectedPapers.length === 0) return;

    const prompt = `Generate an outline for a research paper with the following details:

Title: ${title}

Referenced Papers:
${selectedPapers.map((paper) => `- ${paper.title} (${paper.authors}, ${paper.year})\n  ${paper.description}`).join("\n\n")}

Please provide an outline with main sections and subsections in markdown format:
# Section Title
## Subsection Title
`;

    // Create blob and download
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outline-prompt.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSection = async (title: string) => {
    // Find and update the section
    const sectionIndex = sections.findIndex((s) => s.title === title);
    if (sectionIndex === -1) return;

    try {
      // Create outline object
      const outline: UserOutline = {
        title: title || "Untitled Outline",
        sections,
        papers: selectedPapers,
      };

      // Save to user storage
      await saveOutline(outline);
      alert("Section saved successfully!");
    } catch (error) {
      console.error("Error saving section:", error);
      if ((error as Error).message === "Authentication required") {
        router.push("/auth/signin");
      } else {
        alert("Failed to save section. Please try again.");
      }
    }
  };

  const handleRemoveSection = (title: string) => {
    setSections(sections.filter((s) => s.title !== title));
  };

  const handleAddSection = () => {
    const newSection: UserOutlineSection = {
      title: `Section ${sections.length + 1}`,
      subsections: [],
    };
    setSections([...sections, newSection]);
  };

  const handleBack = () => {
    router.push("/outline/papers");
  };

  const handleSaveProgress = async () => {
    if (!title || selectedPapers.length === 0) return;

    try {
      // Create outline object
      const outline: UserOutline = {
        title,
        sections,
        papers: selectedPapers,
      };

      // Save to user storage
      await saveOutline(outline);
      alert("Progress saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
      if ((error as Error).message === "Authentication required") {
        router.push("/auth/signin");
      } else {
        alert("Failed to save progress. Please try again.");
      }
    }
  };

  const handleGenerate = () => {
    if (sections.length === 0) {
      alert("Please add at least one section before proceeding.");
      return;
    }

    // Pass outline ID in URL
    const outlineId = `outline-${Date.now()}`;
    router.push(`/outline/generate-subsection?outlineId=${outlineId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p>Loading outline data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={handleBack}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <ContentGenerator
        type="section"
        title="Outline Generator"
        currentItem=""
        inputText={inputText}
        items={sections}
        onInputChange={setInputText}
        onApply={handleApply}
        onDownloadPrompt={handleDownloadPrompt}
        onSaveItem={handleSaveSection}
        onRemoveItem={handleRemoveSection}
        onAddItem={handleAddSection}
        onBack={handleBack}
        onSaveProgress={handleSaveProgress}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
