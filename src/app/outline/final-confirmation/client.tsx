"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  UserOutline,
  getOutline,
  saveOutline,
} from "@/lib/actions/outline-content";

export default function FinalConfirmationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outlineId = searchParams.get("outlineId");

  const [outline, setOutline] = useState<UserOutline | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
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
        setMarkdownContent(generateMarkdownContent(loadedOutline));
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
  }, [outlineId, router]);

  function generateMarkdownContent(outline: UserOutline): string {
    return `# ${outline.title}

## Referenced Papers
${outline.papers.map((paper) => `- ${paper.title} (${paper.authors}, ${paper.year})\n  ${paper.description}`).join("\n\n")}

## Outline
${outline.sections
  .map(
    (section, index) =>
      `### ${index + 1}. ${section.title}\n${section.subsections
        .map((subsection) => `- ${subsection}`)
        .join("\n")}`
  )
  .join("\n\n")}`;
  }

  const handleEditOutline = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!outline) return;

    try {
      // Parse markdown content to update outline structure
      const lines = markdownContent.split("\n");
      const updatedSections: typeof outline.sections = [];
      let currentSection = null;
      let subsections: string[] = [];

      for (const line of lines) {
        if (line.startsWith("### ")) {
          // Save previous section if exists
          if (currentSection) {
            updatedSections.push({
              ...currentSection,
              subsections: [...subsections],
            });
          }
          // Start new section
          currentSection = {
            title: line.replace(/^### \d+\. /, "").trim(),
            subsections: [],
          };
          subsections = [];
        } else if (line.startsWith("- ") && currentSection) {
          // Add subsection
          subsections.push(line.replace("- ", "").trim());
        }
      }

      // Add the last section
      if (currentSection) {
        updatedSections.push({
          ...currentSection,
          subsections: [...subsections],
        });
      }

      const updatedOutline = {
        ...outline,
        sections: updatedSections,
      };

      // Save updated outline
      await saveOutline(updatedOutline);
      setOutline(updatedOutline);
      setIsEditing(false);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      if ((error as Error).message === "Authentication required") {
        router.push("/auth/signin");
      } else {
        alert("Failed to save changes. Please try again.");
      }
    }
  };

  const handleBack = () => {
    router.push(`/outline/generate-subsection?outlineId=${outlineId}`);
  };

  const handleConfirmAndDownload = () => {
    if (!outline) return;

    // Create and trigger download
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${outline.title.toLowerCase().replace(/\s+/g, "-")}-outline.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!outline) return null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Final Confirmation</h1>
            <p className="mt-2 text-gray-500">
              Please review and confirm your outline before downloading.
            </p>
          </div>
          {!isEditing && (
            <Button variant="secondary" onClick={handleEditOutline}>
              Edit Outline
            </Button>
          )}
        </div>

        {/* Referenced Papers */}
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h2 className="text-xl font-semibold">Referenced Papers</h2>
          <div className="space-y-4">
            {outline.papers.map((paper) => (
              <div key={paper.id} className="rounded-md bg-white p-4 shadow-sm">
                <h3 className="font-medium">{paper.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {paper.authors} ({paper.year})
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {paper.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Outline Content */}
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              className="min-h-[600px] font-mono"
              placeholder="# Title..."
            />
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 rounded-lg bg-white p-8">
            <h2 className="mb-6 text-2xl font-bold">{outline.title}</h2>
            {outline.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <h3 className="text-lg font-medium">
                  {sectionIndex + 1}. {section.title}
                </h3>
                <div className="space-y-2 pl-6">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="text-gray-700">
                      • {subsection}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleConfirmAndDownload}>
            Confirm and Download
          </Button>
        </div>
      </div>
    </div>
  );
}
