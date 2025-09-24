import { createContext, useContext, useState, useEffect, createElement } from "react";
import type { ReactNode } from "react";
import { themes } from "@/lib/themes";

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState("nebula-purple");

  useEffect(() => {
    const savedTheme = localStorage.getItem("futureBoard-theme");
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      const root = document.documentElement;
      document.body.style.background = theme.gradient;
      
      // Convert hex to HSL and update CSS variables
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
          }
          h /= 6;
        }
        
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };
      
      // Update theme-specific variables (raw HSL triplets)
      root.style.setProperty("--primary", hexToHsl(theme.primary));
      root.style.setProperty("--secondary", hexToHsl(theme.secondary));
      root.style.setProperty("--accent", hexToHsl(theme.accent));
      
      // Update chart colors to match theme
      root.style.setProperty("--chart-1", hexToHsl(theme.primary));
      root.style.setProperty("--chart-2", hexToHsl(theme.secondary));
      root.style.setProperty("--chart-3", hexToHsl(theme.accent));
      
      // Update ring color to match primary
      root.style.setProperty("--ring", hexToHsl(theme.primary));
      
      localStorage.setItem("futureBoard-theme", currentTheme);
    }
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    setCurrentTheme(themeId);
  };

  const value = { currentTheme, setTheme };
  
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}