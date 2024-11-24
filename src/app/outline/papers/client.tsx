"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserPaper } from "@/lib/actions/outline-content";
import {
  findUserPaper,
  getUserPapers,
  initializeDefaultPapers,
} from "@/lib/actions/paper-database";

export default function PapersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const title = searchParams.get("title");

  const [papers, setPapers] = useState<UserPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<UserPaper[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPapers() {
      try {
        setIsLoading(true);
        setError(null);
        // Try to get user's papers
        let userPapers = await getUserPapers();

        // If no papers exist, initialize with defaults
        if (userPapers.length === 0) {
          userPapers = await initializeDefaultPapers();
        }

        setPapers(userPapers);
      } catch (error) {
        console.error("Error loading papers:", error);
        if ((error as Error).message === "Authentication required") {
          router.push("/auth/signin");
        } else {
          setError("Failed to load papers. Please try refreshing the page.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPapers();
  }, [router]);

  const handleAddPaper = async () => {
    if (!searchQuery.trim()) return;

    try {
      const foundPaper = await findUserPaper(searchQuery);
      if (foundPaper && !selectedPapers.some((p) => p.id === foundPaper.id)) {
        setSelectedPapers([...selectedPapers, foundPaper]);
        setSearchQuery("");
      } else {
        alert("Paper not found or already added");
      }
    } catch (error) {
      console.error("Error adding paper:", error);
      if ((error as Error).message === "Authentication required") {
        router.push("/auth/signin");
      } else {
        alert("Failed to add paper. Please try again.");
      }
    }
  };

  const handleRemove = (id: string) => {
    setSelectedPapers(selectedPapers.filter((paper) => paper.id !== id));
  };

  const handleNext = () => {
    if (selectedPapers.length === 0) {
      alert("Please select at least one paper before proceeding.");
      return;
    }

    // Store selected papers in URL for next page
    const paperIds = selectedPapers.map((p) => p.id).join(",");
    router.push(
      `/outline/generate-section?topic=${encodeURIComponent(topic || "")}&title=${encodeURIComponent(title || "")}&papers=${encodeURIComponent(paperIds)}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p>Loading papers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Paper List Generation</h1>
        <p className="text-gray-600">
          Select papers to include in your outline. You can search for papers by
          title or ID.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter paper title or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddPaper()}
              className="flex-grow"
            />
            <Button onClick={handleAddPaper}>Add Paper</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="mb-4 text-xl font-semibold">
          Available Papers ({papers.length})
        </h2>
        {papers.map((paper) => (
          <Card key={paper.id}>
            <CardContent className="pt-6">
              <h3 className="mb-2 text-lg font-semibold">{paper.title}</h3>
              <p className="mb-2 text-sm text-gray-600">
                Authors: {paper.authors}
              </p>
              <p className="mb-4 text-sm text-gray-700">{paper.description}</p>
              {selectedPapers.some((p) => p.id === paper.id) ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(paper.id)}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPapers([...selectedPapers, paper])}
                >
                  Add to Selection
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPapers.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Selected Papers ({selectedPapers.length})
          </h2>
          <div className="space-y-4">
            {selectedPapers.map((paper) => (
              <Card key={paper.id}>
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-lg font-semibold">{paper.title}</h3>
                  <p className="mb-2 text-sm text-gray-600">
                    Authors: {paper.authors}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(paper.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Link href="/outline/topic">
          <Button variant="outline">Back</Button>
        </Link>
        <Button onClick={handleNext} disabled={selectedPapers.length === 0}>
          Next: Generate Section
        </Button>
      </div>
    </div>
  );
}
