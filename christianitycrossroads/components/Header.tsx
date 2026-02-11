import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground">✨</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Christianity Crossroads</h1>
            <p className="text-xs text-muted-foreground">Sacred Collection of Faith</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
