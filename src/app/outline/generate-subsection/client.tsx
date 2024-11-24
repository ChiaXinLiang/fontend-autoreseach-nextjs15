"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ContentGenerator } from "@/components/content-generator";
import {
  UserOutline,
  UserOutlineSection,
  getOutline,
  saveOutline,
} from "@/lib/actions/outline-content";

export default function GenerateSubsectionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outlineId = searchParams.get("outlineId");

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [outline, setOutline] = useState<UserOutline | null>(null);
  const [subsections, setSubsections] = useState<UserOutlineSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load outline data
  useEffect(() => {
    async function loadOutline() {
      if (!outlineId) {
        setError("No outline ID provided. Please go back and try again.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const loadedOutline = await getOutline(outlineId);
        if (!loadedOutline) {
          throw new Error("Outline not found");
        }

        setOutline(loadedOutline);
        const currentSection = loadedOutline.sections[currentChapterIndex];
        if (currentSection) {
          setSubsections(
            currentSection.subsections.map((subsection, index) => ({
              title: `${currentSection.title} - Subsection ${index + 1}`,
              subsections: [subsection],
            }))
          );
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading outline:", error);
        if ((error as Error).message === "Authentication required") {
          router.push("/auth/signin");
        } else {
          setError("Failed to load outline. Please go back and try again.");
        }
        setIsLoading(false);
      }
    }

    loadOutline();
  }, [outlineId, currentChapterIndex, router]);

  if (!outline) {
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
              onClick={() => router.push("/outline/generate-section")}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return null;
  }

  const currentChapter = outline.sections[currentChapterIndex];

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < outline.sections.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const handleApply = () => {
    try {
      // Split input text by newlines and update subsections
      const newSubsections = inputText
        .split("\n")
        .map((text) => text.trim())
        .filter((text) => text);

      setSubsections(
        newSubsections.map((subsection, index) => ({
          title: `${currentChapter.title} - Subsection ${index + 1}`,
          subsections: [subsection],
        }))
      );

      // Update the outline with new subsections
      const updatedSections = [...outline.sections];
      updatedSections[currentChapterIndex] = {
        ...currentChapter,
        subsections: newSubsections,
      };

      const updatedOutline = {
        ...outline,
        sections: updatedSections,
      };

      setOutline(updatedOutline);
    } catch (error) {
      console.error("Error applying subsections:", error);
      alert(
        "Failed to apply subsections. Please check the format and try again."
      );
    }
  };

  const handleDownloadPrompt = () => {
    const prompt = `Generate subsections for the chapter: ${currentChapter.title}

Title: ${outline.title}

Referenced Papers:
${outline.papers.map((paper) => `- ${paper.title} (${paper.authors}, ${paper.year})`).join("\n")}

Current sections:
${outline.sections.map((section) => `# ${section.title}`).join("\n")}

Please provide subsections for the current chapter in a clear and organized format:
## Subsection Title`;

    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentChapter.title.toLowerCase().replace(/\s+/g, "-")}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSubsection = (title: string) => {
    const subsectionToEdit = subsections.find((s) => s.title === title);
    if (subsectionToEdit) {
      setInputText(subsectionToEdit.subsections[0]);
    }
  };

  const handleRemoveSubsection = (title: string) => {
    const updatedSubsections = subsections.filter((s) => s.title !== title);
    setSubsections(updatedSubsections);

    // Update the outline with removed subsection
    const updatedSections = [...outline.sections];
    updatedSections[currentChapterIndex] = {
      ...currentChapter,
      subsections: updatedSubsections.map((s) => s.subsections[0]),
    };

    setOutline({
      ...outline,
      sections: updatedSections,
    });
  };

  const handleAddSubsection = () => {
    const newSubsection: UserOutlineSection = {
      title: `${currentChapter.title} - Subsection ${subsections.length + 1}`,
      subsections: ["New subsection content"],
    };
    setSubsections([...subsections, newSubsection]);
  };

  const handleBack = () => {
    router.push("/outline/generate-section");
  };

  const handleSaveProgress = async () => {
    try {
      if (!outline) return;

      // Save current progress to storage
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
    if (!outline) return;

    // Check if all sections have subsections
    const incompleteSections = outline.sections.filter(
      (s) => !s.subsections.length
    );
    if (incompleteSections.length > 0) {
      alert(
        `Please add subsections for: ${incompleteSections.map((s) => s.title).join(", ")}`
      );
      return;
    }

    router.push(`/outline/final-confirmation?outlineId=${outlineId}`);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <ContentGenerator
        type="subsection"
        title="Subsections Generator"
        currentItem={currentChapter.title}
        inputText={inputText}
        items={subsections}
        onInputChange={setInputText}
        onApply={handleApply}
        onDownloadPrompt={handleDownloadPrompt}
        onSaveItem={handleSaveSubsection}
        onRemoveItem={handleRemoveSubsection}
        onAddItem={handleAddSubsection}
        onPrevious={currentChapterIndex > 0 ? handlePreviousChapter : undefined}
        onNext={
          currentChapterIndex < outline.sections.length - 1
            ? handleNextChapter
            : undefined
        }
        onBack={handleBack}
        onSaveProgress={handleSaveProgress}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
