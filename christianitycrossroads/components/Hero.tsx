'use client';

import Image from 'next/image';
import { useState } from 'react';

export function Hero() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
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
      <div className="relative h-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-primary text-sm font-medium">Curated Collection</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight">
              Christianity
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Crossroads
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Discover sacred wisdom, spiritual growth, and faith-centered literature. Your journey through the crossroads of belief starts here.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
            >
              Explore Collection
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-0 hover:opacity-20 transition-opacity" />
            </button>
            <button className="px-8 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium transition-all duration-300 hover:bg-white/20 hover:border-white/40 active:scale-95">
              Learn More
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-center justify-center">
              <div className="w-1 h-2 rounded-full bg-white/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
