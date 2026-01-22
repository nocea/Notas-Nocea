'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--foreground)',
        cursor: 'pointer',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 0 10px transparent',
      }}
      className="theme-toggle-btn"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 3px var(--primary-glow))' }} />
      )}
      
      <style jsx>{`
        .theme-toggle-btn:hover {
          background-color: var(--secondary);
          box-shadow: 0 0 10px var(--primary-glow);
        }
      `}</style>
    </button>
  );
}
