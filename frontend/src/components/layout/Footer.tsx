'use client';

import Link from 'next/link';
import { ArrowRight, Mail, Send, Twitter } from 'lucide-react';
import { useI18n } from '@/i18n';
import { profile } from '@/data/profile';

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear().toString();

  return (
    <footer className="border-t border-foreground bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 border-x border-border md:grid-cols-[1.1fr_1.9fr_1.3fr_auto]">
        <div className="border-b border-border px-6 py-8 md:border-b-0 md:border-r">
          <div className="font-[family-name:var(--font-exo2)] text-3xl font-black">0xMRO</div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t.footer.desc}</p>
        </div>

        <div className="border-b border-border px-6 py-8 md:border-b-0 md:border-r">
          <p className="font-mono text-xs uppercase text-muted-foreground">Full-stack Web3 engineer</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.footer.copyright.replace('{year}', year)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-8 md:border-b-0 md:border-r">
          <Link href="/projects" className="text-sm font-semibold underline-offset-4 hover:underline">
            {t.nav.projects}
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/about" className="text-sm font-semibold underline-offset-4 hover:underline">
            {t.nav.about}
          </Link>
          <span className="text-muted-foreground">/</span>
          <a href={`mailto:${profile.contact.email}`} className="text-sm font-semibold underline-offset-4 hover:underline">
            Email
          </a>
        </div>

        <div className="flex items-center gap-2 px-6 py-8">
          <a
            href={profile.contact.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="grid size-10 place-items-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <Send className="size-4" />
          </a>
          <a
            href={profile.contact.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="grid size-10 place-items-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <Twitter className="size-4" />
          </a>
          <a
            href={`mailto:${profile.contact.email}`}
            aria-label="Email"
            className="grid size-10 place-items-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <Mail className="size-4" />
          </a>
          <ArrowRight className="ml-2 size-5 text-foreground" />
        </div>
      </div>
    </footer>
  );
}
