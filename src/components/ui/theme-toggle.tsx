"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="size-8 p-0"
      aria-label="Ganti tema tampilan"
      onClick={() => {
        const current = theme === "system" ? resolvedTheme : theme;
        setTheme(current === "dark" ? "light" : "dark");
      }}
    >
      <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Ganti tema tampilan</span>
    </Button>
  );
}
