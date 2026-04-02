
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Heart, 
  Eye, 
  Sparkles, 
  Flame,
  Download,
  Lock,
  Play,
  Smartphone,
  MoreHorizontal
} from 'lucide-react';
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
  isHovered?: boolean;
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
  color,
  coverImage,
  isNew,
  isBestseller,
  isHovered,
  onPay,
}: BookCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const isFree = price === 0;

  // 🔗 Navigate to book details
  const handleCardClick = () => {
    router.push(`/bookDetails/${id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsLiked(!isLiked);
    toast(isLiked ? '💔 Removed' : '❤️ Added to favorites', {
      style: { borderRadius: '12px', fontSize: '13px' }
    });
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (isUnlocked) {
      router.push(`/bookDetails/${id}/read`); // Go to reader if unlocked
      return;
    }

    if (isFree) {
      setIsUnlocked(true);
      toast.success('✅ Free book added!', { icon: '🎉' });
      return;
    }

    // Open M-Pesa payment or go to details
    if (onPay) {
      onPay({ id, title, price, coverImage });
    } else {
      router.push(`/bookDetails/${id}`); // Go to details to pay
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/bookDeails/${id}`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-zinc-100 dark:border-zinc-800 h-full flex flex-col cursor-pointer"
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Badges */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col gap-1.5">
        {isNew && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-500/90 backdrop-blur text-white text-[9px] sm:text-xs font-bold rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">NEW</span>
          </span>
        )}
        {isBestseller && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500/90 backdrop-blur text-white text-[9px] sm:text-xs font-bold rounded-full">
            <Flame className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">HOT</span>
          </span>
        )}
        {discount && discount > 0 && (
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-rose-500/90 backdrop-blur text-white text-[9px] sm:text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
        {isFree && !isUnlocked && (
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-blue-500/90 to-indigo-500/90 backdrop-blur text-white text-[9px] sm:text-xs font-bold rounded-full">
            FREE
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleLike}
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur shadow hover:scale-110 transition-transform"
      >
        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`} />
      </button>

      {/* Cover */}
      <div className={`relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${color}`}>
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-white/30">{title.charAt(0)}</span>
          </div>
        )}

        {/* Hover overlay - desktop only */}
        <div className="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
          <button 
            onClick={handleQuickView}
            className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile rating bar */}
        <div className="sm:hidden absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex text-white">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-white/30'}`} />
              ))}
            </div>
            <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col">
        <span className="text-[10px] sm:text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full w-fit mb-2">
          {genre}
        </span>
        
        <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-zinc-500 mb-2 sm:mb-3">by {author}</p>

        {/* Rating - desktop */}
        <div className="hidden sm:flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
          ))}
          <span className="text-xs font-medium ml-1">{rating.toFixed(1)}</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-zinc-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {isUnlocked ? (
                <span className="text-sm sm:text-lg font-bold text-emerald-600">Owned</span>
              ) : (
                <>
                  <span className="text-base sm:text-xl font-bold">KES {price}</span>
                  {originalPrice && <span className="text-[10px] sm:text-xs text-zinc-400 line-through">KES {originalPrice}</span>}
                </>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUnlock}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                isUnlocked ? 'bg-emerald-500 text-white' : isFree ? 'bg-emerald-500 text-white' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
              }`}
            >
              {isUnlocked ? (
                <><Play className="w-3.5 h-3.5 fill-current" /><span className="hidden xs:inline">Read</span></>
              ) : isFree ? (
                <><Download className="w-3.5 h-3.5" /><span className="hidden xs:inline">Get</span></>
              ) : (
                <><Lock className="w-3.5 h-3.5" /><span className="hidden xs:inline">Unlock</span></>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.4) 55%, transparent 60%)' }}
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
