export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 no-print">
      {/* большие мягкие световые пятна */}
      <div className="absolute -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full bg-[#6001d1]/30 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full bg-[#4F46E5]/30 blur-[120px]" />

      {/* центральное свечение */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(255,255,255,.08),transparent_60%)]" />

      {/* лёгкая виньетка по краям */}
      <div className="absolute inset-0 [mask-image:radial-gradient(75%_75%_at_50%_40%,black_60%,transparent_100%)] bg-black/40" />
    </div>
  );
}