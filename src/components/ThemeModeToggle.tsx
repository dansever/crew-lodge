'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Derive isDark directly from theme instead of storing in state
  const isDark = theme === 'dark';

  // Wait for component to mount before checking theme
  useEffect(() => {
    // Defer state update to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Show a placeholder or neutral state until mounted
  if (!mounted) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="px-5"
    >
      {isDark ? (
        <Sun className="size-4 text-white" />
      ) : (
        <Moon className="size-4 text-slate-800" />
      )}
    </Button>
  );
}
