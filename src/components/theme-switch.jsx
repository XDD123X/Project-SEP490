import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { Check, Moon, Sun } from "lucide-react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <Button variant="outline" size="icon" className="scale-95 rounded-full" onClick={toggleTheme}>
      {theme === "dark" ? (
        <Moon className="size-[1.2rem]" />
      ) : theme === "light" ? (
        <Sun className="size-[1.2rem]" />
      ) : (
        <Sun className="size-[1.2rem] opacity-50" /> // Biểu tượng cho chế độ hệ thống
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
