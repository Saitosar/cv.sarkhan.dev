import Link from "next/link";
import {
  Sparkles,
  Bot,
  Check,
  Send,
  ScanLine,
  FileCheck,
  GraduationCap,
  Target,
  Lightbulb,
} from "lucide-react";

function Step({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl text-center">
      <div className="w-12 h-12 rounded-full bg-[#d2bbff]/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-[#d2bbff]" />
      </div>
      <h3 className="font-display text-lg text-[#e5e2e1] mb-2">{title}</h3>
      <p className="text-sm text-[#e0e0e0] leading-relaxed">{description}</p>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#d2bbff]/20 flex items-center justify-center">
        <Check className="w-3 h-3 text-[#d2bbff]" />
      </div>
      <span className="text-[#e0e0e0]">{text}</span>
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
          Резюме, которое проходит ATS
        </h1>
        <p className="text-lg md:text-xl text-[#e0e0e0] mb-8 max-w-2xl mx-auto leading-relaxed">
          Aether анализирует твои сильные стороны и подстраивает резюме под
          требования вакансии. Твой шанс пройти первый этап.
        </p>
        <Link
          href="/workspace"
          className="shimmer-bg inline-flex items-center gap-3 rounded-lg px-8 py-4 text-white font-semibold tap-feedback"
        >
          <Bot className="w-5 h-5" />
          Начать
        </Link>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl w-full mt-16 md:mt-24">
        <h2 className="font-display text-2xl md:text-3xl text-white text-center mb-8 md:mb-10">
          Как это работает
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Step
            title="Отправь что есть"
            description="Ссылку на LinkedIn, старое резюме или просто напиши о себе произвольным текстом"
            icon={Send}
          />
          <Step
            title="Aether проанализирует"
            description="Выделит сильные стороны под твою вакансию"
            icon={ScanLine}
          />
          <Step
            title="Готовое резюме"
            description="ATS-оптимизированное, под конкретную должность"
            icon={FileCheck}
          />
        </div>
      </section>

      {/* Benefits + ChatGPT quote */}
      <section className="max-w-3xl w-full mt-16 md:mt-24">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-lg md:text-xl text-[#e0e0e0] italic">
            ChatGPT — швейцарский нож. Aether — скальпель для твоего резюме.
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Benefit text="Никаких форм — просто отправь что есть" />
            <Benefit text="Не нужно всё вспоминать — напиши произвольным текстом" />
            <Benefit text="Не нужно собирать с нуля — Aether сделает всё сам" />
            <Benefit text="Быстро, качественно, удобно" />
          </div>
        </div>
      </section>

      {/* More conversion section */}
      <section className="max-w-3xl w-full mt-16 md:mt-24 text-center">
        <h2 className="font-display text-2xl md:text-3xl text-white mb-4">
          Хочешь больше?
        </h2>
        <p className="text-lg text-[#e0e0e0] mb-8 md:mb-10">
          Базовая версия уже готовит твоё резюме. А Pro версия даёт тебе
          суперсилы:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#d2bbff]/20 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-5 h-5 text-[#d2bbff]" />
            </div>
            <h3 className="font-display text-lg text-[#e5e2e1] mb-2">
              HR Coach
            </h3>
            <p className="text-sm text-[#e0e0e0] leading-relaxed">
              AI-коуч подготовит к собеседованию, напишет советы и рекомендации
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#d2bbff]/20 flex items-center justify-center mx-auto mb-4">
              <Target className="w-5 h-5 text-[#d2bbff]" />
            </div>
            <h3 className="font-display text-lg text-[#e5e2e1] mb-2">
              ATS Score
            </h3>
            <p className="text-sm text-[#e0e0e0] leading-relaxed">
              агент проверит и оценит твоё резюме, покажет score
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#d2bbff]/20 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-5 h-5 text-[#d2bbff]" />
            </div>
            <h3 className="font-display text-lg text-[#e5e2e1] mb-2">
              AI Suggestions
            </h3>
            <p className="text-sm text-[#e0e0e0] leading-relaxed">
              персональные рекомендации по улучшению каждого раздела
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="shimmer-bg inline-flex items-center gap-3 rounded-lg px-8 py-4 text-white font-semibold tap-feedback mt-8 md:mt-10"
        >
          Получить больше
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-16 md:pt-24 pb-8 w-full max-w-5xl text-center border-t border-white/10">
        <nav className="flex items-center justify-center gap-6 md:gap-8 mb-4">
          <Link
            href="/pricing"
            className="text-sm text-[#e0e0e0] hover:text-white transition-colors"
          >
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
          <Link
            href="/workspace"
            className="text-sm text-[#e0e0e0] hover:text-white transition-colors"
          >
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
