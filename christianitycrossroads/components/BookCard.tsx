'use client';

import Link from 'next/link';
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
  coverImage?: string; // full Cloudinary URL
}

export function BookCard({
  id,
  title,
  author,
  genre,
  rating,
  color,
  coverImage,
}: BookCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';
  const imageUrl = coverImage || '';

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${backendUrl}/wishlist`, { credentials: 'include' });
        const data = await res.json();
        if (data.wishlist?.some((item: any) => item.book._id === id)) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error('Wishlist fetch error:', err);
      }
    };
    fetchWishlist();
  }, [id, backendUrl]);

  const toggleWishlist = async () => {
    try {
      const url = isFavorite
        ? `${backendUrl}/wishlist/remove/${id}`
        : `${backendUrl}/wishlist/add`;

      const res = await fetch(url, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: isFavorite ? null : JSON.stringify({ bookId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIsFavorite(!isFavorite);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <Link href={`/bookDetails/${id}`} className="group cursor-pointer">
      <div className="relative h-64 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">

        {/* Cover Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`absolute inset-0 ${color} flex flex-col items-center justify-center p-6`}
          >
            <BookOpen className="w-16 h-16 text-white/40 mb-4" />
            <span className="text-white/80 text-sm">No Cover</span>
          </div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-all duration-300" />

        {/* Book info */}
        <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white text-center">
          <h3 className="text-xl font-bold line-clamp-2 mb-2">{title}</h3>
          <p className="text-sm text-white/80 mb-2">{author}</p>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-4">
            {genre}
          </span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-yellow-300 font-semibold">{rating}</span>
            <span className="text-yellow-300">★</span>
          </div>
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent Link click
            toggleWishlist();
          }}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors z-20"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-400 text-red-400' : 'text-white'}`}
          />
        </button>
      </div>
    </Link>
  );
}
