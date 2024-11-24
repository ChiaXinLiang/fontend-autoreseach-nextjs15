"use client";

import React from "react";

import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import {
  IconFileText,
  IconPackage,
  IconPencil,
  IconSearch,
} from "@tabler/icons-react";

import AuthButton from "./auth-button";
import { ThemeSwitcher } from "./theme-switcher";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  // const { user } = useAuth();

  const menuItems = [
    {
      label: "Search Arxiv Papers",
      shortLabel: "Search",
      href: "/search",
      icon: <IconSearch className="h-5 w-5" />,
    },
    {
      label: "Generate Outline",
      shortLabel: "Outline",
      href: "/outline",
      icon: <IconFileText className="h-5 w-5" />,
    },
    {
      label: "Generate Article",
      shortLabel: "Article",
      href: "/article",
      icon: <IconPencil className="h-5 w-5" />,
    },
  ];

  // if (user) {
  //   menuItems.push({
  //     label: "Profile",
  //     shortLabel: "Profile",
  //     href: "/profile",
  //     icon: <IconUser className="h-5 w-5" />,
  //   });
  // }

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand as={Link} href="/" className="cursor-pointer">
          <IconPackage />
          <p className="font-bold text-inherit">AutoResearch Writer</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={`${item}-${index}`}>
            <Link
              className="flex w-full items-center gap-2"
              href={item.href}
              size="lg"
            >
              {item.icon}
              <span className="hidden md:inline lg:hidden">
                {item.shortLabel}
              </span>
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          </NavbarItem>
        ))}
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem>
          <AuthButton minimal={false} />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <NavbarMenuItem>
          <ThemeSwitcher showLabel />
        </NavbarMenuItem>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="flex w-full items-center gap-2"
              href={item.href}
              size="lg"
            >
              {item.icon}
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <AuthButton />
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
