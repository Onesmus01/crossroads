// app/terms/page.jsx
'use client';

import { motion } from 'framer-motion';
import { 
  Scale, 
  Shield, 
  Truck, 
  RefreshCw, 
  CreditCard, 
  FileText,
  AlertCircle,
  ChevronRight,
  ScrollText
} from 'lucide-react';
import { useState } from 'react';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'acceptance',
      icon: FileText,
      title: 'Acceptance of Terms',
      content: `By accessing and using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this website or purchase any products from Reverend Vincent Mboya's Bookstore.

These terms constitute a legally binding agreement between you and Reverend Vincent Mboya Ministries ("we," "us," or "our"), registered in Nairobi, Kenya. We reserve the right to modify these terms at any time without prior notice. Changes will be effective immediately upon posting to this page.`
    },
    {
      id: 'orders',
      icon: CreditCard,
      title: 'Orders & Payments',
      content: `All orders are subject to acceptance and availability. Prices are listed in Kenyan Shillings (KES) and are inclusive of VAT where applicable. We reserve the right to refuse or cancel any order for any reason including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information.

Payment must be received prior to the acceptance of an order. We accept M-Pesa, credit/debit cards, and bank transfers. By submitting an order, you represent and warrant that you are authorized to use the designated payment method.`
    },
    {
      id: 'shipping',
      icon: Truck,
      title: 'Shipping & Delivery',
      content: `We deliver to addresses within Kenya and select international destinations. Delivery times are estimates and commence from the date of shipping, not the date of order. We are not responsible for delays caused by customs, postal delays, or circumstances beyond our control.

Risk of loss and title for items purchased pass to you upon delivery of the item to the carrier. You are responsible for providing accurate shipping information. Additional charges may apply for re-delivery attempts due to incorrect addresses.`
    },
    {
      id: 'returns',
      icon: RefreshCw,
      title: 'Returns & Refunds',
      content: `Physical books may be returned within 14 days of delivery if they are in original, unread condition with all packaging intact. Digital products (e-books) are non-refundable once downloaded or accessed.

To initiate a return, contact us at returns@vincentmboya.org with your order number. Refunds will be processed within 7-14 business days to the original payment method. Shipping costs for returns are the customer's responsibility unless the item is defective or incorrectly shipped.`
    },
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy & Data Protection',
      content: `We comply with the Data Protection Act, 2019 of Kenya. Personal information collected (name, contact details, payment information) is used solely for order processing, delivery, and communication regarding your purchase.

We implement reasonable security measures to protect your data. By using this site, you consent to our collection and use of your information as described in our Privacy Policy. You have the right to access, correct, or request deletion of your personal data by contacting us.`
    },
    {
      id: 'intellectual',
      icon: ScrollText,
      title: 'Intellectual Property',
      content: `All content on this website, including text, graphics, logos, images, and book content, is the property of Reverend Vincent Mboya Ministries or its content suppliers and is protected by Kenyan and international copyright laws.

You may not reproduce, distribute, modify, create derivative works from, or otherwise exploit any content without express written permission. Purchase of a physical or digital book grants you a personal, non-transferable license to read the content only.`
    },
    {
      id: 'liability',
      icon: Scale,
      title: 'Limitation of Liability',
      content: `To the fullest extent permitted by Kenyan law, Reverend Vincent Mboya Ministries shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this website or purchase of products.

Our total liability shall not exceed the amount paid by you for the specific product giving rise to the claim. Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded under applicable law.`
    },
    {
      id: 'governing',
      icon: AlertCircle,
      title: 'Governing Law & Disputes',
      content: `These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising from these terms or your use of this website shall first be attempted to be resolved through good faith negotiation.

If negotiation fails, disputes shall be resolved through arbitration in Nairobi, Kenya, in accordance with the Arbitration Act, 1995. Each party shall bear its own costs. Nothing in this clause limits your rights under the Consumer Protection Act, 2012.`
    }
  ];

  const lastUpdated = "April 4, 2026";

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs sm:text-sm font-medium">
              <Scale className="w-3.5 h-3.5" />
              Legal Information
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900">
              Terms & <span className="text-amber-700">Conditions</span>
            </h1>
            
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
              Please read these terms carefully before using our website or purchasing our books. 
              Last updated: <span className="font-medium text-stone-900">{lastUpdated}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Navigation - Horizontal scroll on mobile */}
      <section className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 sm:py-4 no-scrollbar">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(activeSection === section.id ? null : section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeSection === section.id 
                    ? 'bg-amber-700 text-white' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <section.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{section.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-stone-200 overflow-hidden scroll-mt-24"
            >
              <button
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                  </div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-stone-900 pr-4">
                    {section.title}
                  </h2>
                </div>
                <ChevronRight 
                  className={`w-5 h-5 text-stone-400 transition-transform flex-shrink-0 ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              <motion.div
                initial={false}
                animate={{ 
                  height: activeSection === section.id ? 'auto' : 0,
                  opacity: activeSection === section.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-0">
                  <div className="pl-0 sm:pl-16 border-t border-stone-100 pt-4 sm:pt-5">
                    <p className="text-sm sm:text-base text-stone-600 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-amber-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
            
            <div className="relative z-10 space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-serif font-bold">Questions About These Terms?</h3>
              <p className="text-sm sm:text-base text-amber-100 max-w-lg mx-auto">
                If you have any questions or concerns about our Terms and Conditions, please don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a 
                  href="mailto:legal@vincentmboya.org"
                  className="px-5 py-2.5 bg-white text-amber-900 rounded-full font-medium text-sm hover:bg-amber-50 transition-colors active:scale-95"
                >
                  Email Legal Team
                </a>
                <a 
                  href="/contact"
                  className="px-5 py-2.5 border-2 border-white/30 text-white rounded-full font-medium text-sm hover:bg-white/10 transition-colors active:scale-95"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-white border-t border-stone-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm text-stone-500">
            © {new Date().getFullYear()} Reverend Vincent Mboya Ministries. All rights reserved. 
            These terms are governed by the laws of the Republic of Kenya.
          </p>
        </div>
      </section>
    </main>
  );
}