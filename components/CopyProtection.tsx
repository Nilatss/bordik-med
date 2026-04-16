'use client';

import { useEffect } from 'react';

export default function CopyProtection() {
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();

    // Block copy, cut, paste
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);

    // Block right-click context menu
    document.addEventListener('contextmenu', prevent);

    // Block common keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+U (view source), Ctrl+S (save), Ctrl+P (print), Ctrl+Shift+I (devtools)
      if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Clear clipboard
        navigator.clipboard?.writeText?.('');
      }
    };

    document.addEventListener('keydown', handleKeydown);

    // Block drag
    document.addEventListener('dragstart', prevent);

    return () => {
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('dragstart', prevent);
    };
  }, []);

  return null;
}
