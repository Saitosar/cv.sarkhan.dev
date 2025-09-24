import Link from "next/link";
import { PenLine, FolderClosed, Linkedin } from "lucide-react";

function Card({
  title,
  desc,
  href,
  cta,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="card-3d gradient-border relative">
      {/* Класс 'card-glow' уже здесь - он отвечает за внутреннее свечение */}
      <div className="glass-card relative h-full p-7 md:p-8 flex flex-col items-center text-center">
        {/* иконка */}
        <div className="mb-6">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl
                       bg-gradient-to-br from-neonCyan/20 to-neonViolet/20
                       border border-white/20"
          >
            {icon}
          </div>
        </div>

        {/* заголовок и описание */}
        <h3 className="font-display text-2xl mb-2">{title}</h3>
        <p className="text-white/80 mb-6">{desc}</p>

        {/* кнопка */}
        <span className="btn-pill mt-auto">{cta}</span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 pt-32">
      {/* Компонент <BackgroundFX /> был удален отсюда, 
        потому что он уже глобально вызывается в файле layout.tsx.
        Это избавляет от дублирования.
      */}
      <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl w-full">
        <Card
          title="Create a new resume"
          desc="Start from zero with a smart form."
          href="/create"
          cta="Get Started"
          icon={<PenLine size={32} className="text-neonCyan" />}
        />
        <Card
          title="Update existing resume"
          desc="Upload old CV or paste updates."
          href="/update"
          cta="Upload"
          icon={<FolderClosed size={32} className="text-neonViolet" />}
        />
        <Card
          title="Import from LinkedIn"
          desc="Paste profile URL or upload PDF."
          href="/import"
          cta="Import"
          icon={<Linkedin size={32} className="text-neonCyan" />}
        />
      </div>
    </main>
  );
}