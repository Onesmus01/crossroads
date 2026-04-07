// app/about/page.jsx
'use client';

import { motion } from 'framer-motion';
import { BookOpen, Quote, Award, Heart, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { number: '15+', label: 'Years Ministry', icon: Heart },
    { number: '12', label: 'Books Published', icon: BookOpen },
    { number: '50K+', label: 'Lives Impacted', icon: Award },
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden">
      {/* Hero Section - Compact on mobile */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Image Container - Smaller on mobile to prevent zoom */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto lg:mx-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-[28rem] order-2 lg:order-1"
            >
              <div className="absolute inset-0 bg-amber-600 rounded-3xl rotate-3 opacity-20 blur-xl" />
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                {/* <Image
                  src="/author-photo.jpg" 
                  alt="Reverend Vincent Mboya"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 384px"
                /> */}
                {/* Fallback gradient if no image */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-stone-800 flex items-center justify-center text-white text-4xl sm:text-6xl font-serif">
                  VM
                </div>
              </div>
              
              {/* Floating Badge - Adjusted for mobile */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-4 -right-4 sm:bottom-8 sm:-right-8 bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-stone-100"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Author of</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-900">Grace Unfolding</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content - Tight spacing on mobile */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs sm:text-sm font-medium">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
                  Pastor, Author & Teacher
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold text-stone-900 leading-tight">
                  Reverend <br/>
                  <span className="text-amber-700">Vincent Mboya</span>
                </h1>
                
                <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Dedicated servant of God, passionate author, and spiritual guide. 
                  Bringing light through words that heal, inspire, and transform lives across the nation.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
                  <button className="px-6 py-3 bg-amber-700 text-white rounded-full font-medium text-sm sm:text-base hover:bg-amber-800 transition-colors shadow-lg shadow-amber-700/25 active:scale-95">
                    Explore Books
                  </button>
                  <button className="px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-full font-medium text-sm sm:text-base hover:border-amber-700 hover:text-amber-700 transition-colors active:scale-95">
                    Contact Me
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Horizontal scroll on small screens */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between sm:justify-center gap-4 sm:gap-16 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center min-w-[100px] sm:min-w-0 flex-shrink-0"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 bg-amber-50 rounded-full flex items-center justify-center">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-stone-900">{stat.number}</div>
                <div className="text-xs sm:text-sm text-stone-500 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section - Reduced padding on mobile */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Quote className="w-10 h-10 sm:w-16 sm:h-16 text-amber-600/30 mx-auto mb-4 sm:mb-6" />
            <blockquote className="text-xl sm:text-2xl lg:text-4xl font-serif italic leading-relaxed mb-4 sm:mb-6 px-2 sm:px-8">
              "Words are vessels of grace. When we write with purpose, we don't just fill pages—we fill hearts with eternal hope."
            </blockquote>
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm sm:text-base">
              <div className="h-px w-8 sm:w-12 bg-amber-400/50" />
              <span>Reverend Vincent Mboya</span>
              <div className="h-px w-8 sm:w-12 bg-amber-400/50" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bio Sections - Compact grid on mobile */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            
            {/* Ministry */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">The Ministry</h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                For over fifteen years, Reverend Mboya has served as a beacon of hope in communities across Kenya. 
                His ministry extends beyond the pulpit—reaching into prisons, schools, and rural villages where 
                encouragement is needed most. Through his compassionate teaching style, he makes complex spiritual 
                truths accessible to all.
              </p>
            </motion.div>

            {/* Writing */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">The Writing</h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                With twelve published works spanning devotional literature, theological studies, and inspirational 
                memoirs, Reverend Mboya has established himself as a voice for authentic Christian living in Africa. 
                His books blend deep biblical insight with practical wisdom drawn from years of pastoral care and 
                community service.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission - Full width card, mobile optimized */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-700 to-amber-900 text-white p-6 sm:p-12 lg:p-16"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-3 sm:mb-4">My Mission</h2>
              <p className="text-base sm:text-lg text-amber-100 leading-relaxed mb-6 sm:mb-8">
                To inspire transformation through the written word, bringing hope to the hopeless and clarity to the seeking. 
                Every book is a prayer, every page an invitation to encounter grace.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                  Spiritual Growth
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                  Leadership
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                  Family Values
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA - Simple footer style */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white border-t border-stone-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-600 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Nairobi, Kenya</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="mailto:contact@vincentmboya.org" className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors text-sm">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">contact@vincentmboya.org</span>
              <span className="sm:hidden">Email</span>
            </a>
            <button className="px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors active:scale-95">
              Get in Touch
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}