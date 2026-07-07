import Link from "next/link";
import { ShieldCheck, Bot, Rocket } from "lucide-react";

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="gradient-border relative">
      <div className="glass-panel relative h-full p-6 flex flex-col gap-4">
        <div className="text-[#d2bbff]">{icon}</div>
        <h3 className="font-display text-lg text-[#e5e2e1]">{title}</h3>
        <p className="text-sm text-[#e0e0e0] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-24 pt-16 md:pt-24">
      {/* Hero */}
      <section className="text-center max-w-4xl mb-12 md:mb-16">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
          Build a resume that beats the bots
        </h1>
        <p className="text-lg md:text-xl text-[#e0e0e0] mb-8 max-w-2xl mx-auto leading-relaxed">
          AI-powered resume builder for the international job market. ATS-friendly layouts,
          smart suggestions, and a personal career assistant — all in one workspace.
        </p>
        <Link
          href="/workspace"
          className="shimmer-bg inline-block rounded-lg px-8 py-4 text-white font-semibold tap-feedback"
        >
          Open Workspace
        </Link>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl w-full mt-16 md:mt-24">
        <h2 className="font-display text-2xl md:text-3xl text-white text-center mb-8 md:mb-10">
          Everything you need to land interviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Feature
            title="ATS-Compatible Builder"
            description="Clean, parser-friendly sections that get your resume past automated screening and into human hands."
            icon={<ShieldCheck size={32} strokeWidth={1.5} className="text-[#6001d1]" />}
          />
          <Feature
            title="AI Career Assistant"
            description="Get section-by-section suggestions, rewrites, and career advice tailored to your target role."
            icon={<Bot size={32} strokeWidth={1.5} className="text-[#6001d1]" />}
          />
          <Feature
            title="Launch Faster"
            description="Go from idea to polished PDF in minutes. Export, share, and iterate as your career evolves."
            icon={<Rocket size={32} strokeWidth={1.5} className="text-[#6001d1]" />}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-16 md:pt-24 pb-8 w-full max-w-5xl text-center border-t border-white/10">
        <nav className="flex items-center justify-center gap-6 md:gap-8 mb-4">
          <Link href="/pricing" className="text-sm text-[#e0e0e0] hover:text-white transition-colors">
            Pricing
          </Link>
          <a
            href="https://t.me/cv_sarkhan_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#e0e0e0] hover:text-white transition-colors"
          >
            Telegram
          </a>
          <Link href="/workspace" className="text-sm text-[#e0e0e0] hover:text-white transition-colors">
            Workspace
          </Link>
        </nav>
        <p className="text-xs text-[#c4c7c7]">
          © {new Date().getFullYear()} cv.sarkhan.dev. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
