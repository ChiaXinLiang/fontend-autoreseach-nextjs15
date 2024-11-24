"use client";

import { useRouter } from "next/navigation";

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  Loader2Icon,
  LogInIcon,
  LogOutIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { signOutClient } from "@/lib/actions/auth-client";

export default function AuthButton({ minimal = true }: { minimal?: boolean }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    const success = await signOutClient();
    if (success) {
      router.push("/");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <Loader2Icon
        className="h-5 w-5 animate-spin"
        aria-label="Loading authentication status..."
      />
    );
  }

  if (!user) {
    return (
      <Button
        onClick={() => router.push("/auth/signin")}
        className="flex items-center gap-2 bg-black text-white"
      >
        <LogInIcon className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  if (minimal) {
    return (
      <Button
        onClick={handleSignOut}
        color="danger"
        variant="ghost"
        className="flex items-center gap-2"
      >
        <LogOutIcon className="h-4 w-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          showFallback={!user.image}
          src={user.image || ""}
          fallback={<UserIcon className="h-5 w-5" />}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <div className="flex flex-col">
            <p className="flex items-center gap-2 font-semibold">
              <UserIcon className="h-4 w-4" />
              Signed in as
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <MailIcon className="h-4 w-4" />
              {user.email}
            </p>
          </div>
        </DropdownItem>
        <DropdownItem
          key="sign-out"
          color="danger"
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOutIcon className="h-4 w-4" />
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
