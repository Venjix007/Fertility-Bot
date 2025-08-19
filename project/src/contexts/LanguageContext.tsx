import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'gu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const defaultLanguage: Language = 'en';

// Default translations
const translations: Record<string, Record<Language, string>> = {
  'app.title': {
    en: 'FertilityCare AI',
    hi: 'फर्टिलिटीकेयर एआई',
    gu: 'ફર્ટિલિટીકેયર એઆઇ',
  },
  'app.subtitle': {
    en: 'Your fertility companion',
    hi: 'आपका प्रजनन साथी',
    gu: 'તમારી ફર્ટિલિટી સાથી',
  },
  'language.en': { en: 'English', hi: 'अंग्रेज़ी', gu: 'અંગ્રેજી' },
  'language.hi': { en: 'Hindi', hi: 'हिंदी', gu: 'હિન્દી' },
  'language.gu': { en: 'Gujarati', hi: 'गुजराती', gu: 'ગુજરાતી' },
  'language.selector.aria': {
    en: 'Select language',
    hi: 'भाषा चुनें',
    gu: 'ભાષા પસંદ કરો',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage, default to browser language or 'en'
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('fertilityCareLanguage') as Language | null;
      if (savedLang && ['en', 'hi', 'gu'].includes(savedLang)) {
        return savedLang as Language;
      }
      
      // If no saved language, try to detect from browser
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'hi' || browserLang === 'gu') {
        return browserLang as Language;
      }
    }
    return 'en';
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fertilityCareLanguage', language);
    
    // Dispatch custom event for other components to listen to
    document.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));
  }, [language]);

  // Listen for language change events from other components (like sidebar)
  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: Language }>;
      if (customEvent.detail && customEvent.detail.language) {
        setLanguageState(customEvent.detail.language);
      }
    };

    document.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      document.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
