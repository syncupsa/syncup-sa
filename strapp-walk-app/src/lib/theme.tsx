import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeName = "industrial" | "strapp" | "retail" | "professional";

export const THEMES: { id: ThemeName; label: string; hint: string }[] = [
  { id: "industrial", label: "Industrial", hint: "Heavy operations · field default" },
  { id: "strapp", label: "Strapp", hint: "Original pastel core" },
  { id: "retail", label: "Retail", hint: "Food & service · amber" },
  { id: "professional", label: "Professional", hint: "Firm & legal · serif" },
];

const STORAGE_KEY = "strapp.theme.v1";

interface Ctx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}
const ThemeContext = createContext<Ctx | null>(null);

function apply(theme: ThemeName) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("industrial");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
      if (saved && THEMES.some((t) => t.id === saved)) {
        setThemeState(saved);
        apply(saved);
      } else {
        apply("industrial");
      }
    } catch {
      apply("industrial");
    }
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    apply(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
