'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star, Heart, Lock, Download, Play, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  color: string;
  coverImage?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isUnlocked?: boolean;
  onPay?: (book: any) => void;
}

export function BookCard({
  id,
  title,
  author,
  genre,
  rating,
  price,
  originalPrice,
  discount,
  coverImage,
  isNew,
  isBestseller,
  isUnlocked: initialUnlocked = false,
  onPay,
}: BookCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFree = price === 0;
  const isOwned = initialUnlocked;

  const handleCardClick = () => {
    router.push(`/bookDetails/${id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      icon: isLiked ? '💔' : '❤️',
    });
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPay && !isFree && !isOwned) {
      onPay({ id, title, price, coverImage });
    } else {
      router.push(`/bookDetails/${id}`);
    }
  };

  const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return (
    <motion.div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-zinc-900  overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800 cursor-pointer h-full flex flex-col"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image Container - Fixed aspect ratio */}
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700">
            <span className="text-4xl font-bold text-zinc-400 dark:text-zinc-600">{title.charAt(0)}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              <Sparkles className="w-3 h-3" />
              NEW
            </span>
          )}
          {isBestseller && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              <TrendingUp className="w-3 h-3" />
              BESTSELLER
            </span>
          )}
          {discountPercent > 0 && !isFree && (
            <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isFree && !isOwned && (
            <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              FREE
            </span>
          )}
        </div>

        {/* Wishlist Button - Top Right */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-600 dark:text-zinc-400'}`} />
        </button>

        {/* Rating - Bottom Left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content - Consistent padding */}
      <div className="p-4 flex flex-col flex-1">
        {/* Genre Tag */}
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
          {genre}
        </span>

        {/* Title */}
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Author */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          by {author}
        </p>

        {/* Footer - Price & Action */}
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {isOwned ? (
              <span className="text-sm font-bold text-emerald-600">Owned</span>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">
                    {isFree ? 'Free' : `KES ${price}`}
                  </span>
                  {originalPrice && !isFree && (
                    <span className="text-xs text-zinc-400 line-through">
                      KES {originalPrice}
                    </span>
                  )}
                </div>
                {isFree && <span className="text-xs text-emerald-600 font-medium">Instant access</span>}
              </>
            )}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAction}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isOwned 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : isFree 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900'
            }`}
          >
            {isOwned ? (
              <><Play className="w-3.5 h-3.5 fill-current" /> Read</>
            ) : isFree ? (
              <><Download className="w-3.5 h-3.5" /> Get</>
            ) : (
              <><Lock className="w-3.5 h-3.5" /> Unlock</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}