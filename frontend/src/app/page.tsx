import {
  HeroSection,
  SkillsSection,
  ProjectsSection,
  FooterCTA,
} from '@/components/home';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <HeroSection />
      <SkillsSection />
      <ProjectsSection />
      <FooterCTA />
    </div>
  );
}
