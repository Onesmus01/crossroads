import { Header } from '@/components/Header';
import Hero from '@/components/Hero';
import { BooksSection } from '@/components/BooksSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
    <Hero />
    <div className="-mt-2 sm:-mt-4"> {/* Pulls BooksSection up slightly */}
    <BooksSection 
      title="Featured Books" 
      description="Handpicked for you"
      variant="featured"
    />
  </div>
</main>
      
      <Footer />
    </div>
  );
}