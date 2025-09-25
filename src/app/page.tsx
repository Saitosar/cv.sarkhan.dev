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
      {/* ИЗМЕНЕНИЕ 1: Добавляем 'justify-between', чтобы распределить пространство */}
      <div className="glass-card relative h-full p-7 md:p-8 flex flex-col items-center text-center justify-center gap-y-8">
        
        {/* Иконка */}
        {/* ИЗМЕНЕНИЕ 2: Убираем отступ 'mb-6', так как он больше не нужен */}
        <div>
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-xl
                       bg-gradient-to-br from-neonCyan/20 to-neonViolet/20
                       border border-white/20"
          >
            {icon}
          </div>
        </div>

        {/* Заголовок (без изменений) */}
        <h3 className="font-display text-2xl pb-3">{title}</h3>

        {/* Кнопка */}
        {/* ИЗМЕНЕНИЕ 3: Убираем 'mt-auto' с кнопки */}
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
    icon={
      <PenLine 
        size={32} 
        className="text-icon-pen [filter:drop-shadow(0_0_5px_theme(colors.icon-pen))]" 
      />
    }
  />
  <Card
    title="Update existing CV"
    href="/update"
    cta="Update"
    icon={
      <FolderClosed 
        size={32} 
        className="text-icon-folder [filter:drop-shadow(0_0_5px_theme(colors.icon-folder))]" 
      />
    }
  />
  <Card
    title="Modify from LinkedIn"
    href="/import"
    cta="Import"
    icon={
      <Linkedin 
        size={32} 
        className="text-icon-linkedin [filter:drop-shadow(0_0_5px_theme(colors.icon-linkedin))]" 
      />
    }
  />
</div>
    </main>
  );
}