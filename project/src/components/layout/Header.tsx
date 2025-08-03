import React from 'react';
import { Menu, Heart } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">FertilityCare AI</span>
          </div>
        </div>
      </div>
    </header>
  );
}