// app/features/page.tsx
'use client'

import { motion, useReducedMotion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Smartphone,
  CreditCard,
  Download,
  Headphones,
  Shield,
  Zap,
  Search,
  Moon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  Library,
} from 'lucide-react'

// ─── Animation Hook ──────────────────────────────────────
function useScrollAnimation(threshold = 0.2) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const prefersReduced = useReducedMotion()

  return { ref, isInView, prefersReduced }
}

// ─── Components ──────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay = 0,
}: {
  icon: any
  title: string
  description: string
  color: string
  delay?: number
}) {
  const { ref, isInView, prefersReduced } = useScrollAnimation()

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="group relative p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
    >
      <div
        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      {/* ✅ h3 → h4: feature items are subsections of h3 "Built for Readers" */}
      <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

function StatItem({
  icon: Icon,
  value,
  label,
  delay = 0,
}: {
  icon: any
  value: string
  label: string
  delay?: number
}) {
  const { ref, isInView, prefersReduced } = useScrollAnimation()

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="w-14 h-14 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      </div>
      <span className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-1">
        {value}
      </span>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
    </motion.div>
  )
}

function StepCard({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: string
  title: string
  description: string
  icon: any
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6 relative z-10">
        <Icon className="w-8 h-8 text-white" aria-hidden="true" />
        <span className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white dark:border-zinc-900">
          {number}
        </span>
      </div>
      {/* ✅ h3 → h4: step items are subsections of h3 "Start Reading in Seconds" */}
      <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function TestimonialCard({
  name,
  role,
  quote,
  rating,
}: {
  name: string
  role: string
  quote: string
  rating: number
}) {
  return (
    <article
      className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
      itemScope
      itemType="https://schema.org/Review"
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <blockquote className="text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed italic">
        <span itemProp="reviewBody">&ldquo;{quote}&rdquo;</span>
      </blockquote>
      <footer className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {name.charAt(0)}
        </div>
        <div itemScope itemType="https://schema.org/Person">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white" itemProp="name">
            {name}
          </p>
          <p className="text-xs text-zinc-500" itemProp="jobTitle">
            {role}
          </p>
        </div>
      </footer>
      <meta itemProp="reviewRating" content={String(rating)} />
    </article>
  )
}

// ─── Main Page ───────────────────────────────────────────
export default function FeaturesPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  const features = [
    {
      icon: BookOpen,
      title: 'Vast Digital Library',
      description:
        'Access hundreds of Christian books, devotionals, and theological works from renowned authors worldwide.',
      color: 'bg-blue-500',
    },
    {
      icon: Smartphone,
      title: 'Read Anywhere',
      description:
        'Seamless reading experience across all devices — mobile, tablet, or desktop. Your library syncs automatically.',
      color: 'bg-emerald-500',
    },
    {
      icon: CreditCard,
      title: 'M-Pesa Payments',
      description:
        'Instant, secure payments via M-Pesa STK push. No cards needed — just your phone and PIN.',
      color: 'bg-amber-500',
    },
    {
      icon: Download,
      title: 'Offline Reading',
      description:
        'Download books for offline access. Perfect for commutes, travel, or areas with limited connectivity.',
      color: 'bg-violet-500',
    },
    {
      icon: Headphones,
      title: 'Audio Books',
      description:
        'Listen to your favorite books on the go. High-quality narration for select titles.',
      color: 'bg-rose-500',
    },
    {
      icon: Shield,
      title: 'Secure Purchases',
      description:
        'Your transactions are encrypted and protected. Own your books forever with verified digital receipts.',
      color: 'bg-cyan-500',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description:
        'Books are available immediately after payment. No waiting, no shipping delays.',
      color: 'bg-orange-500',
    },
    {
      icon: Moon,
      title: 'Dark Mode',
      description:
        'Easy on the eyes with a beautiful dark theme. Read comfortably day or night.',
      color: 'bg-indigo-500',
    },
    {
      icon: Search,
      title: 'Smart Search',
      description:
        'Find books by title, author, genre, or topic. Advanced filters help you discover your next read.',
      color: 'bg-teal-500',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Browse & Discover',
      description:
        'Explore our curated collection of Christian literature across genres and topics.',
      icon: Search,
    },
    {
      number: '2',
      title: 'Secure Payment',
      description: 'Pay instantly via M-Pesa. Enter your PIN and confirm the STK push.',
      icon: CreditCard,
    },
    {
      number: '3',
      title: 'Start Reading',
      description:
        'Access your book immediately. Read online or download for offline use.',
      icon: BookOpen,
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ═══════ Hero Section ═══════ */}
      {/* ✅ This page has its own h1 since it renders at /features */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium mb-8 border border-amber-200 dark:border-amber-800"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Everything you need to grow in faith
            </motion.div>

            {/* ✅ h1: This page's main topic */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Your Digital{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
                Sanctuary
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              A premium Christian bookstore built for the modern reader. Discover,
              purchase, and read transformative literature — anytime, anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* ✅ Link instead of button with router.push */}
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Explore Library
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Browse Free Books
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ Stats Bar ═══════ */}
      <section className="bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem icon={Library} value="500+" label="Books Available" delay={0} />
            <StatItem icon={Users} value="10K+" label="Active Readers" delay={0.1} />
            <StatItem icon={TrendingUp} value="50K+" label="Books Sold" delay={0.2} />
            <StatItem icon={Star} value="4.9" label="Average Rating" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ═══════ Features Grid ═══════ */}
      <section className="py-20 sm:py-28" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Powerful Features
              </span>
              {/* ✅ h2: section heading */}
              <h2
                id="features-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
              >
                Built for Readers
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                Every feature designed to make your reading experience seamless,
                secure, and spiritually enriching.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ How It Works ═══════ */}
      <section
        className="py-20 sm:py-28 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800"
        aria-labelledby="steps-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Simple Process
              </span>
              {/* ✅ h2: section heading */}
              <h2
                id="steps-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
              >
                Start Reading in Seconds
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                Three simple steps between you and your next transformative read.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" />
            {steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Why Choose Us ═══════ */}
      <section className="py-20 sm:py-28" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Why Crossroads
              </span>
              {/* ✅ h2: section heading */}
              <h2
                id="why-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-6"
              >
                Faith-Focused,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  Reader-First
                </span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                We believe great Christian literature should be accessible to
                everyone. Our platform combines cutting-edge technology with a
                deep respect for the transformative power of faith-based reading.
              </p>

              <ul className="space-y-4">
                {[
                  'Curated selection of doctrinally sound literature',
                  'Instant M-Pesa payments with secure receipts',
                  'Offline reading for uninterrupted spiritual growth',
                  'New titles added weekly from trusted publishers',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2
                      className="w-5 h-5 text-amber-500 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-8 flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="absolute -top-4 -left-4 w-full aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-xl rotate-[-6deg] shadow-xl" />
                  <div className="absolute -top-2 -left-2 w-full aspect-[2/3] bg-zinc-300 dark:bg-zinc-700 rounded-xl rotate-[-3deg] shadow-xl" />
                  <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-2xl flex items-center justify-center">
                    <BookOpen
                      className="w-20 h-20 text-white/80"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ Testimonials ═══════ */}
      <section
        className="py-20 sm:py-28 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Testimonials
              </span>
              {/* ✅ h2: section heading */}
              <h2
                id="testimonials-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
              >
                Loved by Readers
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                See what our community has to say about their experience.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Sarah M."
              role="Youth Pastor"
              quote="Crossroads has transformed how I access theological resources. The M-Pesa integration makes it so easy to purchase books instantly."
              rating={5}
            />
            <TestimonialCard
              name="James K."
              role="Seminary Student"
              quote="The offline reading feature is a game-changer. I can study during my commute without worrying about data. Highly recommend!"
              rating={5}
            />
            <TestimonialCard
              name="Grace W."
              role="Book Club Leader"
              quote="Our church book club uses Crossroads exclusively. The curated collection ensures we're reading sound, enriching literature."
              rating={4}
            />
          </div>
        </div>
      </section>

      {/* ═══════ CTA Section ═══════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* ✅ h2: section heading */}
            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Start Your Reading{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                Journey Today
              </span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of readers discovering life-changing Christian
              literature. Your next great read is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Browse Collection
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}