"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig } from '@/types/theme';
import { themes, getThemeById } from '@/themes/default-themes';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  availableThemes: Record<string, ThemeConfig>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  customerId?: string; // For multi-tenant support
  defaultThemeId?: string;
}

export function ThemeProvider({ 
  children, 
  customerId,
  defaultThemeId = 'default' 
}: ThemeProviderProps) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(defaultThemeId);
  const [isLoading, setIsLoading] = useState(true);

  // Load customer-specific theme or default
  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      
      try {
        // In a real SaaS app, you'd fetch the customer's theme from your API
        // For now, we'll check localStorage or use default
        const savedThemeId = localStorage.getItem(
          customerId ? `theme-${customerId}` : 'theme'
        );
        
        if (savedThemeId && themes[savedThemeId as keyof typeof themes]) {
          setCurrentThemeId(savedThemeId);
        }
      } catch (error) {
        console.warn('Failed to load theme:', error);
        setCurrentThemeId(defaultThemeId);
      }
      
      setIsLoading(false);
    };

    loadTheme();
  }, [customerId, defaultThemeId]);

  // Apply theme to CSS custom properties
  useEffect(() => {
    const theme = getThemeById(currentThemeId);
    applyThemeToRoot(theme);
  }, [currentThemeId]);

  const setTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    
    // Save theme preference
    try {
      localStorage.setItem(
        customerId ? `theme-${customerId}` : 'theme',
        themeId
      );
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const contextValue: ThemeContextType = {
    currentTheme: getThemeById(currentThemeId),
    setTheme,
    availableThemes: themes,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Apply theme to CSS custom properties
function applyThemeToRoot(theme: ThemeConfig) {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(theme.colors.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });
  
  Object.entries(theme.colors.secondary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-secondary-${shade}`, color);
  });
  
  Object.entries(theme.colors.accent).forEach(([shade, color]) => {
    root.style.setProperty(`--color-accent-${shade}`, color);
  });
  
  Object.entries(theme.colors.neutral).forEach(([shade, color]) => {
    root.style.setProperty(`--color-neutral-${shade}`, color);
  });

  // Apply semantic colors
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-error', theme.colors.error);
  root.style.setProperty('--color-info', theme.colors.info);

  // Apply fonts
  root.style.setProperty('--font-display', theme.fonts.display.join(', '));
  root.style.setProperty('--font-body', theme.fonts.body.join(', '));
  root.style.setProperty('--font-mono', theme.fonts.mono.join(', '));

  // Apply border radius
  Object.entries(theme.borderRadius).forEach(([size, value]) => {
    root.style.setProperty(`--border-radius-${size === 'DEFAULT' ? 'default' : size}`, value);
  });

  // Apply spacing
  Object.entries(theme.spacing).forEach(([size, value]) => {
    root.style.setProperty(`--spacing-${size}`, value);
  });

  // Apply shadows
  Object.entries(theme.shadows).forEach(([size, value]) => {
    root.style.setProperty(`--shadow-${size === 'DEFAULT' ? 'default' : size}`, value);
  });
}
