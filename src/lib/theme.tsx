import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export const themeBootScript = `(function(){try{var t=localStorage.getItem('pf-theme')||'light';document.documentElement.classList.toggle('dark',t!=='light');}catch(e){void 0;}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = (localStorage.getItem("pf-theme") as Theme | null) ?? "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored !== "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("pf-theme", next);
      document.documentElement.classList.toggle("dark", next !== "light");
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
