import { BookCard } from './BookCard';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  color: string;
}

interface BooksSectionProps {
  title: string;
  description?: string;
  books: Book[];
}

export function BooksSection({ title, description, books }: BooksSectionProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>
    </section>
  );
}
