'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Send, Twitter, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { profile } from '@/data/profile';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const navItems = [
    { href: '/', label: t.nav.home, active: pathname === '/' },
    { href: '/projects', label: t.nav.projects, active: pathname.startsWith('/projects') },
    { href: '/about', label: t.nav.about, active: pathname.startsWith('/about') },
    { href: '/about#contact', label: 'Contact', active: false },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/92 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="font-[family-name:var(--font-exo2)] text-2xl font-black leading-none tracking-normal text-foreground">
              0xMRO
            </span>
            <span className="hidden h-5 w-px bg-border sm:block" />
            <span className="hidden font-mono text-[11px] uppercase text-muted-foreground sm:block">
              Web3 systems
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground',
                  item.active && 'text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[var(--site-cyan)]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="outline" size="icon" asChild>
              <a href={profile.contact.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <Send data-icon="inline-start" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={profile.contact.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter data-icon="inline-start" />
              </a>
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X data-icon="inline-start" /> : <Menu data-icon="inline-start" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="flex flex-col gap-2 border-t border-border py-4 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'border-b border-border/70 py-3 text-sm font-semibold transition-colors hover:text-foreground',
                  item.active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Button variant="outline" size="icon" asChild>
                <a href={profile.contact.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <Send data-icon="inline-start" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={profile.contact.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter data-icon="inline-start" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
