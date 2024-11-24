import { requireAuth } from "@/utils/require-auth";

import GenerateSectionClient from "./client";

export default async function GenerateSectionPage() {
  // This will redirect to sign in if user is not authenticated
  await requireAuth();

  return <GenerateSectionClient />;
}
