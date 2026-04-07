'use client';

import Image from 'next/image';
import { useState } from 'react';

function Hero() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative w-full min-h-[55vh] sm:min-h-[60vh] lg:min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/hero-crossroads.jpg"
          alt="Christianity Crossroads"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full min-h-[55vh] sm:min-h-[60vh] lg:min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 pb-4 sm:pb-6 lg:pb-8">
        <div className="max-w-3xl w-full text-center space-y-4 sm:space-y-5 lg:space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-primary text-xs sm:text-sm font-medium tracking-wide">Curated Collection</span>
          </div>

          {/* Heading */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] sm:leading-tight">
              Christianity{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">at</span>
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Crossroads
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Discover sacred wisdom, spiritual growth, and faith-centered literature.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-primary text-primary-foreground text-sm sm:text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              Explore Collection
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </button>
            <button className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm sm:text-base font-medium transition-all duration-300 hover:bg-white/20 hover:border-white/30 active:scale-95">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;