"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Sparkles,
  Search,
  Bitcoin,
  Receipt,
  Home,
  Moon,
  Sun,
  Menu,
  X,
  ImageIcon,
  Eraser,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Sparkles;
  children?: { href: string; label: string; icon: typeof Sparkles }[];
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  {
    href: "/humanizer",
    label: "AI Humanizer",
    icon: Sparkles,
    children: [
      { href: "/watermark-remover", label: "Image Watermark Remover", icon: Eraser },
    ],
  },
  { href: "/detector", label: "AI Detector", icon: Search },
  { href: "/image-detector", label: "Image Detector", icon: ImageIcon },
  { href: "/bitcoin", label: "Bitcoin", icon: Bitcoin },
  { href: "/receipts", label: "Receipts", icon: Receipt },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/icon.jpg" alt="Embertext" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Embertext
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.href} className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.href ? null : item.href)}
                      className={cn(
                        "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                        isActive || item.children?.some(c => pathname === c.href)
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      <ChevronDown className={cn(
                        "w-3 h-3 transition-transform",
                        openDropdown === item.href && "rotate-180"
                      )} />
                      {(isActive || item.children?.some(c => pathname === c.href)) && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {openDropdown === item.href && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-56 rounded-xl glass-card shadow-xl border border-border/50 py-1 z-50"
                        >
                          <Link
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                              pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setOpenDropdown(null)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                  isChildActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                              >
                                <ChildIcon className="w-4 h-4" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/50 glass"
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <div className="ml-6 space-y-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isChildActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            <ChildIcon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
