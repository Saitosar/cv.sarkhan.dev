import Link from "next/link";
import { PenLine, FolderClosed, Linkedin } from "lucide-react";

function Card({
  title,
  href,
  cta,
  icon,
}: {
  title: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="card-3d gradient-border relative">
      {/* Основной контейнер glass-card уже является flex-контейнером.
        Мы убираем лишнюю вложенную обертку.
      */}
      <div className="glass-card relative h-full p-7 md:p-8 flex flex-col items-center text-center">
        
        {/* Иконка */}
        <div className="mb-6">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl
                       bg-gradient-to-br from-neonCyan/20 to-neonViolet/20
                       border border-white/20"
          >
            {icon}
          </div>
        </div>

        {/* Заголовок */}
        <h3 className="font-display text-2xl">{title}</h3>

        {/* Кнопка. Теперь класс 'mt-auto' будет работать правильно,
          так как он сможет "оттолкнуть" кнопку от заголовка вниз.
        */}
        <span className="card-button">{cta}</span>
      </div>
    </Link>
  );
}


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 pt-32">
      <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl w-full">
        <Card
          title="Create from scratch"
          href="/create"
          cta="Create"
          icon={<PenLine size={32} className="text-neonCyan" />}
        />
        <Card
          title="Update existing CV"
          href="/update"
          cta="Update"
          icon={<FolderClosed size={32} className="text-neonViolet" />}
        />
        <Card
          title="Modify from LinkedIn"
          href="/import"
          cta="Import"
          icon={<Linkedin size={32} className="text-neonCyan" />}
        />
      </div>
    </main>
  );
}