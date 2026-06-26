'use client';

import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { profile } from '@/data/profile';
import { useI18n } from '@/i18n';

const contactCopy = {
  zh: {
    title: '一起构建可检查、可使用的 Web3 产品',
    desc:
      '如果你正在做 Web3 界面、智能合约 demo 或产品原型，可以发我一封邮件。我会给出一个务实的下一步。',
    email: '发送邮件',
  },
  en: {
    title: "Let's build something inspectable",
    desc:
      "Have a Web3 interface, smart-contract demo, or product prototype in mind? Send a note and I'll respond with a practical next step.",
    email: 'Email me',
  },
};

function ProtocolSketch() {
  return (
    <div className="relative min-h-[320px] overflow-hidden border border-border bg-card">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 360" aria-hidden="true">
        <path d="M104 74 L252 142 L386 88 L536 184 L462 286 L302 218 L158 284" fill="none" stroke="var(--border)" strokeWidth="2" />
        <path d="M252 142 L302 218 L386 88" fill="none" stroke="var(--site-cyan)" strokeWidth="2" strokeDasharray="6 8" />
        <path d="M386 88 L462 286" fill="none" stroke="var(--site-red)" strokeWidth="2" strokeDasharray="6 8" />
        <path d="M158 284 L302 218" fill="none" stroke="var(--site-green)" strokeWidth="2" strokeDasharray="6 8" />
        {[104, 252, 386, 536, 462, 302, 158].map((x, index) => {
          const y = [74, 142, 88, 184, 286, 218, 284][index];
          const color = index % 3 === 0 ? 'var(--site-cyan)' : index % 3 === 1 ? 'var(--site-red)' : 'var(--site-green)';
          return <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width="12" height="12" fill="var(--background)" stroke={color} strokeWidth="2" />;
        })}
      </svg>
      <div className="absolute left-6 top-6 font-mono text-xs text-muted-foreground">0x9B...C8AD / TRANSFER</div>
      <div className="absolute right-8 top-24 font-mono text-xs text-[var(--site-cyan)]">CALL</div>
      <div className="absolute bottom-8 left-10 font-mono text-xs text-[var(--site-green)]">EVENT</div>
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-foreground/40" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-foreground/30" />
    </div>
  );
}

export function FooterCTA() {
  const { language } = useI18n();
  const copy = contactCopy[language];

  return (
    <section id="contact" className="bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <h2 className="font-[family-name:var(--font-exo2)] text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
            {copy.title}
          </h2>
          <div className="mt-7 h-1 w-20 bg-[var(--site-cyan)]" />
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">{copy.desc}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <a href={`mailto:${profile.contact.email}`}>
                <Mail data-icon="inline-start" />
                {copy.email}
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/projects">
                Projects
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
        <ProtocolSketch />
      </div>
    </section>
  );
}
