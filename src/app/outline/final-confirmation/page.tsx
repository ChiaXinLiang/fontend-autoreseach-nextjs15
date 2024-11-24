import { requireAuth } from "@/utils/require-auth";

import FinalConfirmationClient from "./client";

export default async function FinalConfirmationPage() {
  // This will redirect to sign in if user is not authenticated
  await requireAuth();

  return <FinalConfirmationClient />;
}
