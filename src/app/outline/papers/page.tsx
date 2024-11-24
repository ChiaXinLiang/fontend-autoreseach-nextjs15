import { requireAuth } from "@/utils/require-auth";

import PapersClient from "./client";

export default async function PapersPage() {
  // This will redirect to sign in if user is not authenticated
  await requireAuth();

  return <PapersClient />;
}
