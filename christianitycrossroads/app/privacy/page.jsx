// app/privacy/page.jsx
'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Share2, 
  Trash2, 
  Cookie, 
  Globe, 
  Users,
  FileKey,
  ChevronRight,
  Mail
} from 'lucide-react';
import { useState } from 'react';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'controller',
      icon: Shield,
      title: 'Data Controller',
      content: `Reverend Vincent Mboya Ministries, located in Nairobi, Kenya, is the data controller responsible for your personal information collected through this website and our book sales services.

Registered Address: Nairobi, Kenya  
Data Protection Officer: privacy@vincentmboya.org  
Registration: In compliance with the Data Protection Act, 2019 of Kenya (Act No. 24 of 2019) and registered with the Office of the Data Protection Commissioner (ODPC).`
    },
    {
      id: 'collection',
      icon: Database,
      title: 'Information We Collect',
      content: `We collect and process the following categories of personal data:

Personal Identification: Name, email address, phone number, postal address, and ID number (for high-value orders as required by Kenyan tax law).

Transaction Data: Payment details (processed securely via M-Pesa, card payments), purchase history, billing and delivery addresses.

Technical Data: IP address, browser type and version, time zone setting, operating system, and device information collected through cookies and similar technologies.

Usage Data: Information about how you use our website, products, and services, including page views, search queries, and referral sources.

Communications: Records of your correspondence with us via email, phone, or contact forms.`
    },
    {
      id: 'usage',
      icon: Eye,
      title: 'How We Use Your Data',
      content: `We process your personal data for the following lawful purposes:

Order Fulfillment: To process and deliver your book orders, manage payments, and provide order confirmations and updates.

Customer Support: To respond to your inquiries, handle returns/refunds, and provide after-sales support.

Legal Compliance: To comply with Kenyan tax laws (KRA requirements), consumer protection regulations, and prevent fraud.

Marketing (with consent): To send you newsletters, promotional offers, and information about new book releases. You may opt-out at any time.

Website Improvement: To analyze usage patterns, improve our website functionality, and enhance user experience.

Security: To protect our website, business, and customers from fraud, cyber threats, and unauthorized access.`
    },
    {
      id: 'legal-basis',
      icon: FileKey,
      title: 'Legal Basis for Processing',
      content: `Under the Data Protection Act, 2019, we rely on the following lawful bases:

Contractual Necessity: Processing necessary to fulfill our contract with you when you purchase books.

Legal Obligation: Processing required to comply with Kenyan laws (tax, consumer protection, court orders).

Consent: For marketing communications and non-essential cookies. You have the right to withdraw consent at any time.

Legitimate Interests: For fraud prevention, network security, and business analytics, provided your rights do not override these interests.

Vital Interests: In rare cases, to protect someone's life (e.g., emergency contact situations).`
    },
    {
      id: 'sharing',
      icon: Share2,
      title: 'Data Sharing & Third Parties',
      content: `We only share your data with trusted third parties when necessary:

Service Providers: Payment processors (M-Pesa, banks), delivery/courier services (G4S, Fargo Courier), and cloud hosting providers (AWS, Google Cloud).

Legal Authorities: Kenya Revenue Authority (KRA) for tax compliance, police, or courts when legally required or to protect our rights.

Business Transfers: In the event of a merger, acquisition, or asset sale, your data may be transferred with appropriate safeguards.

We do not sell, rent, or trade your personal information to third parties for marketing purposes. All third parties are contractually bound to process data only for specified purposes and maintain confidentiality.`
    },
    {
      id: 'security',
      icon: Lock,
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your data:

Encryption: SSL/TLS encryption for data in transit; AES-256 encryption for sensitive data at rest.

Access Controls: Role-based access limits, strong password policies, and two-factor authentication for staff.

Physical Security: Secure servers with restricted access and environmental controls.

Regular Audits: Security assessments, penetration testing, and compliance monitoring.

Payment Security: We do not store your full credit card details. Payments are processed via PCI-DSS compliant gateways (M-Pesa, Stripe).

Despite these measures, no internet transmission is entirely secure. We encourage you to use strong passwords and keep your login credentials confidential.`
    },
    {
      id: 'retention',
      icon: Database,
      title: 'Data Retention',
      content: `We retain your personal data only as long as necessary:

Active Accounts: While your account remains active or as needed to provide services.

Transaction Records: 7 years after your last purchase (as required by Kenyan tax law and limitation of actions).

Marketing Data: Until you unsubscribe or withdraw consent.

Inactive Accounts: Personal data deleted 2 years after last activity, unless legal obligations require retention.

Security Logs: 12 months for fraud prevention and security investigations.

When data is no longer needed, we securely delete or anonymize it using industry-standard methods.`
    },
    {
      id: 'rights',
      icon: Users,
      title: 'Your Data Protection Rights',
      content: `Under the Data Protection Act, 2019, you have the following rights:

Right to Access: Request a copy of the personal data we hold about you.

Right to Rectification: Correct inaccurate or incomplete data.

Right to Erasure ("Right to be Forgotten"): Request deletion of your data when there's no compelling reason for continued processing.

Right to Restrict Processing: Limit how we use your data in certain circumstances.

Right to Data Portability: Receive your data in a structured, machine-readable format or request transfer to another controller.

Right to Object: Object to processing based on legitimate interests or direct marketing.

Right to Withdraw Consent: Withdraw previously given consent at any time.

To exercise these rights, contact our Data Protection Officer at privacy@vincentmboya.org. We respond to all requests within 30 days as required by law.`
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: 'Cookies & Tracking',
      content: `We use cookies and similar technologies to enhance your experience:

Essential Cookies: Necessary for website functionality (shopping cart, login sessions). Cannot be disabled.

Analytics Cookies: Google Analytics and similar tools to understand website usage (anonymized data).

Marketing Cookies: Facebook Pixel, Google Ads for targeted advertising (only with consent).

Preference Cookies: Remember your settings (language, region) for convenience.

You can manage cookie preferences through your browser settings or our cookie consent banner. Disabling certain cookies may affect website functionality.

Our website respects "Do Not Track" signals where technically feasible.`
    },
    {
      id: 'transfers',
      icon: Globe,
      title: 'International Data Transfers',
      content: `Some of our service providers (cloud hosting, email services) may process data outside Kenya, including in the United States, European Union, and South Africa.

When we transfer data internationally, we ensure appropriate safeguards:

-Adequacy decisions by the ODPC regarding the destination country
-Standard Contractual Clauses (SCCs) approved by the ODPC
-Binding Corporate Rules for intra-group transfers
-Encryption and pseudonymization where appropriate

We ensure that international transfers comply with Section 48 of the Data Protection Act, 2019, and that your data receives protection comparable to Kenyan standards.`
    },
    {
      id: 'children',
      icon: Users,
      title: "Children's Privacy",
      content: `Our website is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16.

If you are under 16, please do not provide any personal information or use this website without parental consent.

If we discover that we have collected personal data from a child under 16 without verification of parental consent, we will delete that information immediately.

Parents or guardians who believe their child has provided us with personal data may contact us at privacy@vincentmboya.org to request deletion.`
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs sm:text-sm font-medium">
              <Shield className="w-3.5 h-3.5" />
              Data Protection
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900">
              Privacy <span className="text-emerald-700">Policy</span>
            </h1>
            
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
              Your privacy is sacred to us. This policy explains how we collect, use, and protect your personal data in compliance with the Kenyan Data Protection Act, 2019.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500 pt-2">
              <span className="px-3 py-1 bg-stone-100 rounded-full">Last updated: {lastUpdated}</span>
              <span className="hidden sm:inline">•</span>
              <span className="px-3 py-1 bg-stone-100 rounded-full">ODPC Compliant</span>
              <span className="hidden sm:inline">•</span>
              <span className="px-3 py-1 bg-stone-100 rounded-full">Act No. 24 of 2019</span>
            </div>
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
                    ? 'bg-emerald-700 text-white' 
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
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

          {/* Special Contact Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Data Protection Officer
                </h3>
                <p className="text-sm text-emerald-100">
                  For privacy-related queries or to exercise your rights under the Data Protection Act, 2019:
                </p>
                <p className="text-sm font-mono bg-emerald-800/50 inline-block px-3 py-1 rounded-lg">
                  privacy@vincentmboya.org
                </p>
              </div>
              <a 
                href="mailto:privacy@vincentmboya.org"
                className="px-5 py-2.5 bg-white text-emerald-900 rounded-full font-medium text-sm hover:bg-emerald-50 transition-colors active:scale-95 whitespace-nowrap"
              >
                Contact DPO
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-white border-t border-stone-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-xs sm:text-sm text-stone-500">
            © {new Date().getFullYear()} Reverend Vincent Mboya Ministries. All rights reserved.
          </p>
          <p className="text-xs text-stone-400 max-w-2xl mx-auto">
            This privacy policy is compliant with the Data Protection Act, 2019 of Kenya and regulations issued by the Office of the Data Protection Commissioner (ODPC). 
            We are committed to protecting your personal data and respecting your privacy rights.
          </p>
        </div>
      </section>
    </main>
  );
}