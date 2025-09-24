export default function Header() {
  return (
    <header className="mx-auto mt-8 px-4">
      <div className="relative gradient-border glass glow inner-highlight rounded-full px-6 py-3 flex items-center gap-4 w-full max-w-6xl">
        {/* Левый блок: логотип/название */}
        <span className="font-display tracking-wide">Resume Generator</span>

        {/* Правый блок: текст + кнопка */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-white/75">Want to save your resumes?</span>
          <button className="btn-pill" type="button">Sign in</button>
        </div>
      </div>
    </header>
  );
}
