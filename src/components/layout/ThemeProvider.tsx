"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine theme based on time
    const checkTime = () => {
      const hour = new Date().getHours();
      // Light theme from 6 AM to 6 PM (daylight)
      const isDay = hour >= 6 && hour < 18;
      const newTheme = isDay ? 'light' : 'dark';
      
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Update body background color for a smoother transition
      if (newTheme === 'light') {
        document.body.style.backgroundColor = 'rgb(252, 250, 245)';
      } else {
        document.body.style.backgroundColor = 'rgb(10, 10, 15)';
      }
    };

    checkTime();
    setMounted(true);

    // Re-check periodically
    const interval = setInterval(checkTime, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
