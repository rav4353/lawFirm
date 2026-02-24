import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("app-theme") || "light"
  );
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme, location.pathname]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
