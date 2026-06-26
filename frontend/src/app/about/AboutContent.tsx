'use client';

import { ArrowRight, Briefcase, Code2, Mail, MapPin, Send, ShieldCheck, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { profile } from '@/data/profile';
import { skills } from '@/data/projects';
import { useI18n } from '@/i18n';

const aboutCopy = {
  zh: {
    title: '关于 0xMRO',
    intro:
      'Web3 前端工程师 / 智能合约开发者，关注 DeFi、DApp 和让链上系统更容易使用的产品界面。',
    profile: '个人档案',
    principles: '工作原则',
    dossier: '技术档案',
    experience: '经历',
    contact: '联系方式',
    facts: ['中国', '8+ 年开发经验', 'DeFi / DApp / Solidity'],
    principlesList: [
      ['为清晰度构建', '界面应该揭示系统状态，而不是隐藏复杂性。'],
      ['精准交付', '写清楚的代码，验证关键路径，关注真实可用性。'],
      ['安全默认', '最小化信任，验证假设，尊重链上资产风险。'],
    ],
    timeline: [
      ['2023 - 现在', 'Web3 前端开发', '构建 DeFi、交易和 DApp 界面，连接合约与产品体验。'],
      ['此前', '全栈工程实践', '长期参与 Web 应用开发，关注性能、可靠性和交互质量。'],
    ],
  },
  en: {
    title: 'About 0xMRO',
    intro:
      'Web3 frontend engineer and smart-contract developer focused on DeFi, DApps, and interfaces that make onchain systems easier to use.',
    profile: 'Profile',
    principles: 'Working principles',
    dossier: 'Technical dossier',
    experience: 'Experience',
    contact: 'Contact',
    facts: ['China', '8+ years development', 'DeFi / DApp / Solidity'],
    principlesList: [
      ['Build for clarity', 'Interfaces should reveal system state, not hide it.'],
      ['Ship with precision', 'Write clean code, verify core paths, and focus on real usability.'],
      ['Security by default', 'Minimize trust, verify assumptions, and respect onchain risk.'],
    ],
    timeline: [
      ['2023 - Present', 'Web3 Frontend Engineer', 'Building DeFi, trading, and DApp interfaces with smart-contract integration.'],
      ['Earlier', 'Full-stack engineering', 'Long-running web application practice focused on performance, reliability, and UX quality.'],
    ],
  },
};

function DossierPanel() {
  const groups: Array<[string, string[], string]> = [
    ['Frontend', skills.frontend.slice(0, 6), 'text-[var(--site-cyan)]'],
    ['Smart contracts', skills.smart_contract, 'text-[var(--site-red)]'],
    ['Infra & tools', [...skills.blockchain.slice(0, 3), ...skills.tools.slice(0, 3)], 'text-[var(--site-green)]'],
  ];

  return (
    <div className="border border-foreground bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-xl font-semibold">Technical dossier</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="h-px w-4 bg-current" />
          <span className="size-2 border border-current" />
          <span className="text-sm">x</span>
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1fr_0.72fr]">
        <div className="relative min-h-[360px] border-b border-border p-8 lg:border-b-0 lg:border-r">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 360" aria-hidden="true">
            <path d="M86 92 L236 72 L350 154 L470 108 L416 282 L242 236 L130 290" fill="none" stroke="var(--border)" strokeWidth="2" />
            <path d="M236 72 L242 236 L350 154" fill="none" stroke="var(--site-cyan)" strokeDasharray="5 8" strokeWidth="2" />
            <path d="M350 154 L416 282" fill="none" stroke="var(--site-red)" strokeDasharray="5 8" strokeWidth="2" />
            <path d="M130 290 L242 236" fill="none" stroke="var(--site-green)" strokeDasharray="5 8" strokeWidth="2" />
            {[86, 236, 350, 470, 416, 242, 130].map((x, index) => {
              const y = [92, 72, 154, 108, 282, 236, 290][index];
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x - 5}
                  y={y - 5}
                  width="10"
                  height="10"
                  fill="var(--background)"
                  stroke={index % 3 === 0 ? 'var(--site-cyan)' : index % 3 === 1 ? 'var(--site-red)' : 'var(--site-green)'}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-foreground/40" />
          <div className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-foreground/30" />
        </div>
        <div className="flex flex-col">
          {groups.map(([title, items, color]) => (
            <div key={title as string} className="border-b border-border p-5 last:border-b-0">
              <h3 className={`font-mono text-sm font-semibold ${color}`}>{title}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(items as string[]).map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AboutContent() {
  const { language } = useI18n();
  const copy = aboutCopy[language];
  const contactLinks = [
    { icon: Send, label: 'Telegram', href: profile.contact.telegram, value: '@AugustMake', color: 'text-[var(--site-cyan)]' },
    { icon: Twitter, label: 'Twitter', href: profile.contact.twitter, value: '@zhero85762818', color: 'text-[var(--site-cyan)]' },
    { icon: Mail, label: 'Email', href: `mailto:${profile.contact.email}`, value: profile.contact.email, color: 'text-[var(--site-green)]' },
  ];

  return (
    <div className="min-h-screen border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <h1 className="font-[family-name:var(--font-exo2)] text-5xl font-black leading-none tracking-normal sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <div className="mt-7 h-1 w-20 bg-[var(--site-cyan)]" />
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>

            <section className="mt-10 border-y border-border">
              <h2 className="border-b border-border py-5 text-2xl font-bold">{copy.profile}</h2>
              {copy.facts.map((fact, index) => {
                const icons = [MapPin, Briefcase, Code2];
                const Icon = icons[index];
                const colors = ['text-[var(--site-cyan)]', 'text-[var(--site-red)]', 'text-[var(--site-green)]'];

                return (
                  <div key={fact} className="grid grid-cols-[48px_1fr] items-center gap-5 border-b border-border py-5 last:border-b-0">
                    <Icon className={`size-6 ${colors[index]}`} />
                    <span className="font-mono text-base">{fact}</span>
                  </div>
                );
              })}
            </section>

            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">{copy.principles}</h2>
              <div className="border-y border-border">
                {copy.principlesList.map(([title, desc], index) => (
                  <div key={title} className="grid gap-4 border-b border-border py-5 last:border-b-0 sm:grid-cols-[44px_1fr]">
                    <ShieldCheck className={index === 0 ? 'size-6 text-[var(--site-cyan)]' : index === 1 ? 'size-6 text-[var(--site-red)]' : 'size-6 text-[var(--site-green)]'} />
                    <div>
                      <h3 className="font-mono text-base font-semibold">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <DossierPanel />

            <section className="border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">{copy.experience}</h2>
              <div className="mt-6 border-l border-border pl-6">
                {copy.timeline.map(([period, title, desc], index) => (
                  <div key={period} className="relative border-b border-dashed border-border py-5 first:pt-0 last:border-b-0 last:pb-0">
                    <span className={index === 0 ? 'absolute -left-[31px] top-1 size-3 border bg-background border-[var(--site-cyan)]' : 'absolute -left-[31px] top-6 size-3 border bg-background border-[var(--site-red)]'} />
                    <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                      <span className={index === 0 ? 'font-mono text-sm text-[var(--site-cyan)]' : 'font-mono text-sm text-[var(--site-red)]'}>
                        {period}
                      </span>
                      <div>
                        <h3 className="font-mono text-base font-semibold">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section id="contact" className="mt-12 grid border-y border-border md:grid-cols-[180px_1fr]">
          <h2 className="border-b border-border px-6 py-6 text-2xl font-bold md:border-b-0 md:border-r">
            {copy.contact}
          </h2>
          <div className="grid md:grid-cols-3">
            {contactLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-4 border-b border-border px-6 py-6 transition-colors last:border-b-0 hover:bg-accent/45 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <Icon className={`size-7 ${link.color}`} />
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{link.label}</p>
                    <p className="truncate text-sm text-muted-foreground">{link.value}</p>
                  </div>
                  <ArrowRight className="ml-auto size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </a>
              );
            })}
          </div>
        </section>

        <div className="mt-10">
          <Button asChild>
            <a href={`mailto:${profile.contact.email}`}>
              <Mail data-icon="inline-start" />
              Email
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
