// app/contact/page.jsx
'use client';

import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'rev.vincentmboya@gmail.com',
      href: 'mailto:rev.vincentmboya@gmail.com',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+254 712 345 678',
      href: 'tel:+254712345678',
      color: 'bg-green-50 text-green-700'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Nairobi, Kenya',
      href: '#',
      color: 'bg-amber-50 text-amber-700'
    },
    {
      icon: Clock,
      label: 'Office Hours',
      value: 'Mon - Fri: 9AM - 5PM',
      href: '#',
      color: 'bg-purple-50 text-purple-700'
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600 hover:text-white' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500 hover:text-white' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600 hover:text-white' },
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {/* Hero Section - Compact on mobile */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:pt-24 sm:pb-12 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs sm:text-sm font-medium">
              <MessageCircle className="w-3.5 h-3.5" />
              Get in Touch
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900">
              Let's <span className="text-amber-700">Connect</span>
            </h1>
            
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto px-2 sm:px-0">
              Have a question about a book, ministry event, or speaking engagement? 
              I'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
            
            {/* Contact Info Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-3 sm:space-y-4"
            >
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200 space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mb-3 sm:mb-4">
                  Contact Information
                </h2>
                
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-start gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-stone-50 transition-colors group"
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-stone-500 mb-0.5">{item.label}</p>
                      <p className="text-sm sm:text-base font-medium text-stone-900 truncate">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-3">Follow Ministry</h3>
                <div className="flex gap-2 sm:gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 transition-all ${social.color} active:scale-95`}
                    >
                      <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Note */}
              <div className="bg-amber-900 text-white rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
                <div className="relative z-10">
                  <h3 className="text-base sm:text-lg font-serif font-bold mb-1.5 sm:mb-2">Prayer Requests</h3>
                  <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                    For urgent prayer requests, please mark your message as "Prayer" in the subject line.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-stone-200 p-5 sm:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-5 sm:mb-6">
                  Send a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-stone-700 ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-stone-700 ml-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-stone-700 ml-1">
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select a topic...</option>
                        <option value="book-order">Book Order Inquiry</option>
                        <option value="ministry">Ministry Event</option>
                        <option value="speaking">Speaking Engagement</option>
                        <option value="prayer">Prayer Request</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-stone-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-stone-700 ml-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none placeholder:text-stone-400"
                      placeholder="How can I help you today?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-amber-700 text-white rounded-xl font-medium text-sm sm:text-base hover:bg-amber-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-700/25 active:scale-[0.98] touch-manipulation"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : submitted ? (
                      <>
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                        <span>Message Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Placeholder or Additional Info */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-stone-200 rounded-2xl sm:rounded-3xl h-48 sm:h-64 lg:h-80 flex items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-400 opacity-50" />
            <div className="relative z-10 text-center px-4">
              <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-stone-500 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-stone-600 font-medium">Nairobi, Kenya</p>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">Ministry Headquarters</p>
            </div>
            {/* Decorative grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }} />
          </motion.div>
        </div>
      </section>
    </main>
  );
}