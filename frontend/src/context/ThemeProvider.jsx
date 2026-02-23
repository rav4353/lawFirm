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
    // Force dark mode on specific paths as requested by user
    const isDarkModeForced = location.pathname === "/login" || location.pathname === "/register";

    root.classList.remove("light", "dark");
    
    if (isDarkModeForced) {
      root.classList.add("dark");
    } else {
      root.classList.add(theme);
    }
  }, [theme, location.pathname]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
