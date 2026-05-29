'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Heart, Lock, Download, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';
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
  priority?: boolean;
}

export function BookCard({
  id,
  title,
  author,
  genre,
  rating,
  price,
  coverImage,
  isNew,
  isBestseller,
  isUnlocked: initialUnlocked = false,
  onPay,
  priority = false,
}: BookCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFree = price === 0;
  const isOwned = initialUnlocked;

  const handleCardClick = useCallback(() => {
    router.push(`/bookDetails/${id}`);
  }, [router, id]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(prev => !prev);
    toast(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      icon: isLiked ? '💔' : '❤️',
    });
  }, [isLiked]);

  const handleAction = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFree && !isOwned && onPay) {
      onPay({ id, title, price, coverImage });
    } else {
      router.push(`/bookDetails/${id}`);
    }
  }, [onPay, isFree, isOwned, id, title, price, coverImage, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  return (
    <motion.div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${title} by ${author}`}
      className="group relative bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800 cursor-pointer h-full flex flex-col rounded-lg"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      itemScope
      itemType="https://schema.org/Book"
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {coverImage ? (
          <>
            <Image
              src={coverImage}
              alt={`Cover of ${title}`}
              title={`${title} book cover`}
              width={280}
              height={420}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              quality={75}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              className={`object-cover w-full h-full transition-all duration-500 ${
                isHovered ? 'scale-105' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700">
            <span className="text-2xl sm:text-4xl font-bold text-zinc-400 dark:text-zinc-600">
              {title.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* ─── BADGES ─── */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
          
          {/* YOURS badge */}
          {isOwned && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm"
            >
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
              YOURS
            </motion.span>
          )}
          
          {isNew && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
              NEW
            </span>
          )}
          {isBestseller && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
              HOT
            </span>
          )}
          {isFree && !isOwned && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm">
              FREE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleLike}
          aria-label={isLiked ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-sm hover:scale-110 transition-transform z-10 focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-600 dark:text-zinc-400'
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Rating */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center gap-0.5 sm:gap-1 bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-white text-[10px] sm:text-xs font-bold">
            {(rating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 sm:mb-2 uppercase tracking-wider">
          {genre}
        </span>

        <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-primary transition-colors" itemProp="name">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4" itemProp="author">
          by {author}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {isOwned ? (
              <span className="text-xs sm:text-sm font-bold text-emerald-600">Paid</span>
            ) : (
              <span className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <meta itemProp="priceCurrency" content="KES" />
                <meta itemProp="price" content={String(price)} />
                <meta itemProp="availability" content="https://schema.org/InStock" />
                {isFree ? 'Free' : `KES ${price}`}
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAction}
            aria-label={
              isOwned 
                ? `${title} is paid` 
                : isFree 
                  ? `Download ${title}` 
                  : `Unlock ${title}`
            }
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isOwned 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400' 
                : isFree 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400'
                  : 'bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 focus:ring-zinc-400'
            }`}
          >
            {isOwned ? (
              <>
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                <span>Paid</span>
              </>
            ) : isFree ? (
              <>
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                <span>Get</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                <span>Unlock</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}