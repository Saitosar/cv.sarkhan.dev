import Link from "next/link";
import { PenLine, FolderUp, Sparkles } from "lucide-react";

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
  const isComingSoon = href === "#";

  if (isComingSoon) {
    return (
      <div className="card-3d gradient-border relative no-select opacity-70 cursor-not-allowed">
        <div className="glass-card relative h-full p-5 md:p-7 lg:p-8 flex flex-col items-center text-center justify-center gap-y-6 md:gap-y-8 min-h-[280px]">

          {/* Icon */}
          {icon}

          {/* Title */}
          <h3 className="font-display text-xl md:text-2xl pb-3 md:pb-5">{title}</h3>

          {/* Button */}
          <span className="card-button opacity-60">{cta}</span>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="card-3d gradient-border relative tap-feedback no-select">
      <div className="glass-card relative h-full p-5 md:p-7 lg:p-8 flex flex-col items-center text-center justify-center gap-y-6 md:gap-y-8 min-h-[280px]">

        {/* Icon */}
        {icon}

        {/* Title */}
        <h3 className="font-display text-xl md:text-2xl pb-3 md:pb-5">{title}</h3>

        {/* Button */}
        <span className="card-button">{cta}</span>
      </div>
    </Link>
  );
}


export default function Home() {
  return (
<main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-24 pt-16 md:pt-24">
      <div className="mt-8 md:mt-12 grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl w-full">
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
          title="More features soon"
          href="#"
          cta="Coming Soon"
          icon={

            <Sparkles
              size={72}
              strokeWidth={0.5}
              className="glow-soon"
            />
          }
        />
      </div>
    </main>
  );
}