import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { BooksSection } from '@/components/BooksSection';
import { Footer } from '@/components/Footer';

const books = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    rating: 4.8,
    color: 'bg-gradient-to-br from-blue-600 to-blue-800',
  },
  {
    id: '2',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: 'Sci-Fi',
    rating: 4.7,
    color: 'bg-gradient-to-br from-orange-500 to-red-600',
  },
  {
    id: '3',
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    genre: 'Fantasy',
    rating: 4.9,
    color: 'bg-gradient-to-br from-purple-600 to-pink-600',
  },
  {
    id: '4',
    title: 'Lessons in Chemistry',
    author: 'Bonnie Garmus',
    genre: 'Historical Fiction',
    rating: 4.6,
    color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
  },
  {
    id: '5',
    title: 'Verity',
    author: 'Colleen Hoover',
    genre: 'Thriller',
    rating: 4.9,
    color: 'bg-gradient-to-br from-red-600 to-rose-700',
  },
  {
    id: '6',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    genre: 'Fantasy',
    rating: 4.7,
    color: 'bg-gradient-to-br from-indigo-600 to-purple-700',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <BooksSection title="Your Collection" description="Explore your curated selection of extraordinary reads" books={books} />
      <Footer />
    </div>
  );
}
