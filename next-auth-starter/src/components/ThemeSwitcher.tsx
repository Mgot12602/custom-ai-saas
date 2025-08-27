"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

export default function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const { currentTheme, setTheme, availableThemes, isLoading } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 w-32 bg-secondary-200 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-between w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-secondary-300 dark:border-neutral-700 rounded-md shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          id="theme-menu"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: currentTheme.colors.primary[500] }}
            ></div>
            <span className="font-display">{currentTheme.name}</span>
          </div>
          <svg
            className="-mr-1 ml-2 h-5 w-5 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-secondary-200 dark:border-neutral-700"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-menu"
        >
          <div className="py-1" role="none">
            {Object.values(availableThemes).map((theme) => (
              <button
                key={theme.id}
                className={`flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 ${
                  currentTheme.id === theme.id
                    ? "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
                role="menuitem"
                onClick={() => {
                  setTheme(theme.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="flex space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.primary[500] }}
                    ></div>
                    <div 
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.secondary[500] }}
                    ></div>
                    <div 
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.accent[500] }}
                    ></div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-display font-medium">{theme.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {theme.id} theme
                    </div>
                  </div>
                  {currentTheme.id === theme.id && (
                    <svg
                      className="w-4 h-4 text-primary-600 dark:text-primary-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="border-t border-secondary-200 dark:border-neutral-700">
            <div className="px-4 py-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-body">
                Theme changes apply instantly and are saved automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
