"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ContentGenerationProps {
  selectedSection: string;
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
}

export default function ContentGeneration({
  selectedSection,
  markdownContent,
  setMarkdownContent,
}: ContentGenerationProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  return (
    <Card className="bg-white p-6">
      <div className="mb-6">
        <h2 className="text-xl font-medium">Content</h2>
        <p className="mt-1 text-sm text-gray-600">
          Showing content for: {selectedSection}
        </p>
      </div>

      {isEditing ? (
        <div className="mb-4">
          <Textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="mb-4 min-h-[150px] w-full"
          />
          <Button
            className="bg-slate-800 text-white hover:bg-slate-900"
            onClick={handleSaveClick}
          >
            Save Content
          </Button>
        </div>
      ) : (
        <div className="mb-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-gray-700">
          {markdownContent}
        </div>
      )}

      {!isEditing && (
        <Button
          className="bg-slate-800 text-white hover:bg-slate-900"
          onClick={handleEditClick}
        >
          Edit Content
        </Button>
      )}
    </Card>
  );
}
