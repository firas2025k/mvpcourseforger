// components/shared/LanguageSwitcher.tsx
'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { useTranslation } from 'react-i18next'; // Change this from 'next-i18next'
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const { t, i18n } = useTranslation('common'); // Use useTranslation from 'react-i18next'

  const changeLanguage = (locale: string) => {
    // The current pathname will include the locale segment (e.g., /en/dashboard)
    // We need to replace the current locale segment with the new one.
    const currentLocale = i18n.language;
    let newPathname = pathname;

    // Check if the current pathname starts with a locale segment (e.g., /en or /fr)
    // and replace it with the new locale.
    // This handles cases like /en/dashboard -> /fr/dashboard
    // and also / (default locale) -> /fr
    const localeSegments = ['en', 'fr']; // Get this from your next-i18next.config.js
    const regex = new RegExp(`^/(${localeSegments.join('|')})(/|$)`);

    if (regex.test(pathname)) {
      newPathname = pathname.replace(regex, `/${locale}$2`);
    } else {
      // If the path doesn't start with a locale (e.g., if defaultLocale is not prefixed)
      // or if it's the root path, prepend the new locale.
      newPathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    }

    router.push(newPathname);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;