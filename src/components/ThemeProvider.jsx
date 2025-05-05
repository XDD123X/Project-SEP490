/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";

// Định nghĩa các loại theme
const initialState = {
  theme: "system",
  setTheme: () => null,
};

// Tạo context cho ThemeProvider
const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({ children, defaultTheme = "light", storageKey = "theme", ...props }) {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(storageKey);

    if (savedTheme) {
      return savedTheme;
    }

    // Nếu chưa tồn tại trong localStorage, lấy theo hệ thống và lưu lại
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    const initial = defaultTheme === "system" ? systemTheme : defaultTheme;
    localStorage.setItem(storageKey, initial);
    return initial;
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    // Xóa các class light và dark
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
