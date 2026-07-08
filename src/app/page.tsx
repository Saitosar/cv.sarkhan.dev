import Link from "next/link";
import { Sparkles, MessageSquareText, Bot, ShieldCheck, Rocket } from "lucide-react";

function Feature({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="gradient-border relative group">
      <div className="glass-panel relative h-full p-6 flex flex-col gap-4 transition-all duration-300 hover:bg-white/[0.03]">
        <div className="text-[#d2bbff]">
          <Icon className="w-7 h-7" />
        </div>
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[#d2bbff]/20 mb-6">
          <Sparkles className="w-4 h-4 text-[#d2bbff]" />
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#d2bbff]">
            AI Career Agent
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
          Your resume, built by conversation
        </h1>
        <p className="text-lg md:text-xl text-[#e0e0e0] mb-8 max-w-2xl mx-auto leading-relaxed">
          This is not a classic form-filling app. It is an AI agent — you chat with it, and it does
          the work: builds, tailors, and optimizes your resume for ATS and recruiters.
        </p>
        <Link
          href="/workspace"
          className="shimmer-bg inline-flex items-center gap-3 rounded-lg px-8 py-4 text-white font-semibold tap-feedback"
        >
          <Bot className="w-5 h-5" />
          Start with AI
        </Link>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl w-full mt-16 md:mt-24">
        <h2 className="font-display text-2xl md:text-3xl text-white text-center mb-8 md:mb-10">
          Everything you need to land interviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Feature
            title="Chat, Don't Type Forms"
            description="Just tell Aether about your experience. It structures everything into a polished, ATS-friendly resume."
            icon={MessageSquareText}
          />
          <Feature
            title="ATS-Optimized Output"
            description="Clean, parser-friendly sections designed to pass automated screening and reach human recruiters."
            icon={ShieldCheck}
          />
          <Feature
            title="Launch Faster"
            description="Go from first message to interview-ready PDF in minutes. Iterate by simply talking to your agent."
            icon={Rocket}
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
