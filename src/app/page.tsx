import Link from "next/link";
import { PenLine, FolderUp, Linkedin } from "lucide-react";

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
      <div className="glass-card relative h-full p-7 md:p-8 flex flex-col items-center text-center justify-center gap-y-8">
        
        {/* ИЗМЕНЕНИЕ 1: Мы убрали 'стеклянный контейнер' вокруг иконки */}
        {icon}

        {/* Заголовок */}
        <h3 className="font-display text-2xl pb-5">{title}</h3>

        {/* Кнопка */}
        <span className="card-button">{cta}</span>
      </div>
    </Link>
  );
}


export default function Home() {
  return (
<main className="flex min-h-screen flex-col items-center p-8 md:p-24 pt-24">
      <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl w-full">
        <Card
          title="Create from scratch"
          href="/create"
          cta="Create"
          icon={
            
            <PenLine 
              size={72}
              strokeWidth={0.5} 
              className="glow-pen"
            />
          }
        />
        <Card
          title="Update existing CV"
          href="/update"
          cta="Update"
          icon={
         
            <FolderUp
              size={72} 
              strokeWidth={0.5} 
              className="glow-folder"
            />
          }
        />
        <Card
          title="Modify from LinkedIn"
          href="/import"
          cta="Import"
          icon={
          
            <Linkedin 
              size={72} 
              strokeWidth={0.5} 
              className="glow-linkedin"
            />
          }
        />
      </div>
    </main>
  );
}