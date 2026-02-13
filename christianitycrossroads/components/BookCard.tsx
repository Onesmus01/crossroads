'use client';

import { BookOpen, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  color: string;
}

export function BookCard({ id, title, author, genre, rating, color }: BookCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

  // Check if the book is already in wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${backendUrl}/wishlist/add`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.wishlist?.some((item: any) => item.book._id === id)) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWishlist();
  }, [id]);

  const toggleWishlist = async () => {
    try {
      if (isFavorite) {
        // Remove from wishlist
        const res = await fetch(`${backendUrl}/wishlist/remove/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setIsFavorite(false);
          toast.success(data.message || 'Removed from wishlist');
        } else {
          toast.error(data.message || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const res = await fetch(`${backendUrl}/wishlist/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ bookId: id }),
        });
        const data = await res.json();
        if (res.ok) {
          setIsFavorite(true);
          toast.success(data.message || 'Added to wishlist');
        } else {
          toast.error(data.message || 'Failed to add to wishlist');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

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
            toggleWishlist();
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
