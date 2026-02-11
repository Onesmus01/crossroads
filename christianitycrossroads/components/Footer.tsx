export function Footer() {
  return (
    <footer className="border-t border-border mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-foreground mb-4">Bookshelf</h3>
            <p className="text-sm text-muted-foreground">Your personal library, beautifully organized.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  All Books
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Trending
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Categories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Sign In
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  My Library
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Settings
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2026 Bookshelf. All rights reserved.</p>
          <p>Crafted with care for book lovers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
