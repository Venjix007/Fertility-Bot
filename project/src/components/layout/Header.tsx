import React, { useState } from 'react';
import { Menu, Sun, Moon, Heart, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('language.en'), flag: '🇬🇧' },
    { code: 'hi', name: t('language.hi'), flag: '🇮🇳' },
    { code: 'gu', name: t('language.gu'), flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <header className="md:hidden bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-b border-neutral-100 dark:border-neutral-700/50 px-5 py-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-xl flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-primary-600 dark:text-primary-300" />
            </div>
            <div>
              <h1 className="font-bold text-neutral-800 dark:text-white text-lg leading-tight">
                {t('app.title')}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-0.5">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Language Selector - Made more prominent */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-600/80 transition-all border-2 border-primary-300 dark:border-primary-500 shadow-md hover:shadow-lg"
              style={{
                minWidth: '80px',
                justifyContent: 'space-between',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}
              aria-label={t('language.selector.aria')}
              aria-expanded={isLanguageOpen}
              aria-haspopup="listbox"
            >
              <span className="text-base" role="img" aria-label={currentLanguage.name}>
                {currentLanguage.flag}
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {currentLanguage.code.toUpperCase()}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform ${isLanguageOpen ? 'transform rotate-180' : ''}`} 
                aria-hidden="true"
              />
            </button>

            {/* Language dropdown */}
            {isLanguageOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLanguageOpen(false)}
                  aria-hidden="true"
                />
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg py-1 z-50 border border-neutral-100 dark:border-neutral-700 overflow-hidden"
                  role="listbox"
                  aria-label="Select language"
                >
                  <div className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-700">
                    {t('language.select')}
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'hi' | 'gu');
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between ${
                        language === lang.code 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                      }`}
                      role="option"
                      aria-selected={language === lang.code}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base" role="img" aria-hidden="true">
                          {lang.flag}
                        </span>
                        <div className="text-left">
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {lang.code === 'en' ? 'English' : lang.code === 'hi' ? 'हिंदी' : 'ગુજરાતી'}
                          </div>
                        </div>
                      </div>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-xl transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}