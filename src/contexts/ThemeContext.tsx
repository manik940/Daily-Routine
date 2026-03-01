import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "default" | "red" | "green" | "blue" | "orange" | "mix";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("app_theme") as Theme) || "default";
    } catch (e) {
      return "default";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("app_theme", theme);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
