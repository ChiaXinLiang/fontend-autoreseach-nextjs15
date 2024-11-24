import { requireAuth } from "@/utils/require-auth";

import GenerateSubsectionClient from "./client";

export default async function GenerateSubsectionPage() {
  // This will redirect to sign in if user is not authenticated
  await requireAuth();

  return <GenerateSubsectionClient />;
}
