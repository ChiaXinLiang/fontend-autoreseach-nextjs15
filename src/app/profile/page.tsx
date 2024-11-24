import { requireAuth } from "@/utils/require-auth";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </h2>
              <p className="mt-1 text-lg">{user.name}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </h2>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
