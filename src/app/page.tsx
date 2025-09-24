import Link from "next/link";
import BackgroundFX from "@/components/BackgroundFX";
import { PenLine, FolderClosed, Linkedin } from "lucide-react";

function Card({
  title, desc, href, cta, icon,
}: {
  title: string; desc: string; href: string; cta: string; icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="card-3d">
      <div className="glass-card h-full p-7 md:p-8 flex flex-col items-center">
        {/* иконка */}
        <div className="mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl
                          bg-gradient-to-br from-neonCyan/20 to-neonViolet/20
                          border border-white/20">
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
    <main className="min-h-screen relative">
      <BackgroundFX />

      {/* floating Sign in top-right */}
      <div className="fixed right-6 top-6 z-10">
        <button className="btn-pill">Sign in</button>
      </div>

      {/* big centered title */}
      <section className="container mx-auto px-4 pt-24 md:pt-28 text-center">
        <h1 className="font-display text-4xl md:text-6xl tracking-tight drop-shadow
                       bg-clip-text text-transparent
                       bg-gradient-to-b from-white via-white to-white/70">
          Resume Generator
        </h1>
      </section>

      {/* three cards */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          <Card
            title="Create a new resume"
            desc="Start from zero with a smart form."
            href="/create"
            cta="Get Started"
            icon={<PenLine size={24} className="text-neonCyan" />}
          />
          <Card
            title="Update existing resume"
            desc="Upload old CV or paste updates."
            href="/update"
            cta="Upload"
            icon={<FolderClosed size={24} className="text-neonViolet" />}
          />
          <Card
            title="Import from LinkedIn"
            desc="Paste profile URL or upload PDF."
            href="/import"
            cta="Import"
            icon={<Linkedin size={24} className="text-neonCyan" />}
          />
        </div>
      </section>
    
    </main>
  );
}
