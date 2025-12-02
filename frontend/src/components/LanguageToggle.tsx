'use client';

import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {language === 'zh' ? 'Switch to English' : '切换到中文'}
      </span>
    </Button>
  );
}
