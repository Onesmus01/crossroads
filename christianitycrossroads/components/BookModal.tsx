'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Heart, Share2, Truck, Shield, Package, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface BookDetailModalProps {
  book: {
    id: string;
    title: string;
    author: string;
    genre: string;
    rating: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    coverImage?: string;
    description?: string;
    pages?: number;
    language?: string;
    publisher?: string;
    publishedDate?: string;
    isbn?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

export function BookDetailModal({ book, isOpen, onClose, onAddToCart }: BookDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');

  if (!book) return null;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold">Book Details</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8 p-6">
                  {/* Image Section */}
                  <div className="space-y-4">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-400 to-purple-600 relative">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <BookOpen className="w-24 h-24 opacity-50" />
                        </div>
                      )}
                      
                      {book.discount && book.discount > 0 && (
                        <span className="absolute top-4 left-4 px-3 py-1.5 bg-rose-500 text-white font-bold rounded-full">
                          -{book.discount}%
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Gallery (Mock) */}
                    <div className="flex gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <button
                          key={i}
                          className="w-20 h-20 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary transition-colors overflow-hidden"
                        >
                          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <span className="text-xs text-zinc-400">View {i}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="space-y-6">
                    {/* Title & Rating */}
                    <div>
                      <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mb-3">
                        {book.genre}
                      </span>
                      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                      <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                        by <span className="font-medium text-foreground">{book.author}</span>
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(book.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{book.rating}</span>
                        <span className="text-zinc-400">(128 reviews)</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 py-4 border-y border-zinc-100 dark:border-zinc-800">
                      <span className="text-4xl font-bold text-primary">${book.price}</span>
                      {book.originalPrice && (
                        <span className="text-xl text-zinc-400 line-through">
                          ${book.originalPrice}
                        </span>
                      )}
                      {book.discount && book.discount > 0 && (
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          You save ${(book.originalPrice! - book.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Description Tabs */}
                    <div className="space-y-4">
                      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => setActiveTab('description')}
                          className={`pb-2 text-sm font-medium transition-colors relative ${
                            activeTab === 'description'
                              ? 'text-primary'
                              : 'text-zinc-500 hover:text-foreground'
                          }`}
                        >
                          Description
                          {activeTab === 'description' && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab('details')}
                          className={`pb-2 text-sm font-medium transition-colors relative ${
                            activeTab === 'details'
                              ? 'text-primary'
                              : 'text-zinc-500 hover:text-foreground'
                          }`}
                        >
                          Details
                          {activeTab === 'details' && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            />
                          )}
                        </button>
                      </div>

                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-zinc-600 dark:text-zinc-300 leading-relaxed"
                      >
                        {activeTab === 'description' ? (
                          <p>
                            {book.description || 
                              `Immerse yourself in this captivating ${book.genre.toLowerCase()} masterpiece by ${book.author}. 
                              This book offers a compelling narrative that will keep you engaged from start to finish. 
                              Perfect for readers who enjoy thought-provoking stories with rich character development.`}
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-zinc-400 block">Pages</span>
                              <span className="font-medium">{book.pages || '324 pages'}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400 block">Language</span>
                              <span className="font-medium">{book.language || 'English'}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400 block">Publisher</span>
                              <span className="font-medium">{book.publisher || 'Penguin Books'}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400 block">ISBN</span>
                              <span className="font-medium">{book.isbn || '978-3-16-148410-0'}</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">Quantity:</span>
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 font-medium w-12 text-center">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onAddToCart();
                            toast.success(`Added ${quantity} item(s) to cart!`);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart - ${(book.price * quantity).toFixed(2)}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShare}
                          className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Truck className="w-4 h-4 text-emerald-500" />
                        <span>Free Shipping</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Package className="w-4 h-4 text-amber-500" />
                        <span>Easy Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
