import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'system' | 'dark-flat' | 'dark-accent' | 'light-accent' | 'light-flat';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentTheme: Theme; // The actual resolved theme (system resolves to dark-flat or light-flat)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to 'system'
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const applyTheme = () => {
      const html = document.documentElement;
      
      // Remove all theme classes
      html.classList.remove('theme-dark-flat', 'theme-dark-accent', 'theme-light-accent', 'theme-light-flat');
      
      let resolvedTheme: Theme = theme;
      
      if (theme === 'system') {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolvedTheme = prefersDark ? 'dark-flat' : 'light-flat';
        // Apply the resolved theme class
        html.classList.add(`theme-${resolvedTheme}`);
      } else {
        // Apply the specific theme class
        html.classList.add(`theme-${theme}`);
        resolvedTheme = theme;
      }
      
      setCurrentTheme(resolvedTheme);
    };

    applyTheme();

    // Listen for system theme changes when using 'system' theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};