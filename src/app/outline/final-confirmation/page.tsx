"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type Outline, sampleOutlines } from "@/data/sample-outlines";

export default function FinalConfirmationPage() {
  const router = useRouter();
  const [outline] = useState<Outline>(() => sampleOutlines[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(() => {
    return generateMarkdownContent(outline);
  });

  function generateMarkdownContent(outline: Outline): string {
    return `# ${outline.title}\n\n${outline.sections
      .map(
        (section) =>
          `## ${section.title}\nDescription: This section provides an overview of ${section.title.toLowerCase()}.\n${section.subsections
            .map(
              (subsection) =>
                `### ${subsection}\nDescription: ${subsection} details and analysis.`
            )
            .join("\n")}`
      )
      .join("\n\n")}`;
  }

  const handleEditOutline = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // Here you would typically parse the markdown and update the outline
    console.log("Saving markdown:", markdownContent);
  };

  const handleBack = () => {
    router.push("/outline/generate-subsection");
  };

  const handleConfirmAndDownload = () => {
    // Create and trigger download
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outline.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Final Confirmation</h1>
            <p className="mt-2 text-gray-500">
              Please review and confirm your modified outline before submission.
            </p>
          </div>
          {!isEditing && (
            <Button variant="secondary" onClick={handleEditOutline}>
              Edit Outline
            </Button>
          )}
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
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        ) : (
          <div className="space-y-8 rounded-lg bg-white p-8">
            {outline.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium">
                    {sectionIndex + 1}.{section.title}
                  </h2>
                  <p className="mt-1 text-gray-500">
                    Description: This section provides an overview of{" "}
                    {section.title.toLowerCase()}.
                  </p>
                </div>
                <div className="space-y-4 pl-6">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="font-medium text-gray-700">
                        {subsection}
                      </h3>
                      <p className="mt-1 text-gray-500">
                        Description: {subsection} details and analysis.
                      </p>
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
