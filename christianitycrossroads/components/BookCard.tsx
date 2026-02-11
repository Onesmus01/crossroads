'use client';

import { BookOpen, Heart } from 'lucide-react';
import { useState } from 'react';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  color: string;
}

export function BookCard({ title, author, genre, rating, color }: BookCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group cursor-pointer">
      <div
        className={`relative h-64 rounded-xl ${color} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden flex flex-col items-center justify-center p-6 text-center`}
      >
        <BookOpen className="w-16 h-16 text-white/40 mb-4" />
        <h3 className="font-display text-xl font-bold text-white line-clamp-2 mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{author}</p>
        <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-4">
          {genre}
        </span>
        <div className="mt-auto flex items-center gap-1">
          <span className="text-yellow-300 font-semibold">{rating}</span>
          <span className="text-yellow-300">★</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-400 text-red-400' : 'text-white'}`}
          />
        </button>
      </div>
    </div>
  );
}
