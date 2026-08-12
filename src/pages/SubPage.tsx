import React from 'react';
import { useLocation, Link } from 'react-router';
import { motion } from 'motion/react';
import { Info, Shield, HelpCircle, FileText, BookOpen, Mail, Calendar, Briefcase, ArrowLeft } from 'lucide-react';

const PAGE_DATA: Record<string, { title: string; subtitle: string; icon: any; content: React.ReactNode }> = {
  '/about': {
    title: 'About Fav Animals',
    subtitle: 'Building a home for writers, creators, and animal enthusiasts.',
    icon: Info,
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>
          Fav Animals is a modern digital publishing platform designed to empower storytellers, developers, and creators to express their thoughts and share rich knowledge with a global audience.
        </p>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white pt-2">Our Mission</h3>
        <p>
          Our mission is to foster an inclusive, high-quality community where every writer can publish freely with Markdown, interact with real-time feedback, and build a lasting audience.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300">100k+</h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">Active Readers</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Markdown</h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">Native Support</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300">AI Powered</h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">Writing Assistance</p>
          </div>
        </div>
      </div>
    ),
  },
  '/guidelines': {
    title: 'Community Guidelines',
    subtitle: 'Rules of respect, quality, and engagement on our platform.',
    icon: BookOpen,
    content: (
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <ul className="space-y-3 list-disc pl-5">
          <li><strong>Be Respectful:</strong> Treat fellow writers and readers with kindness. Constructive criticism is welcome; harassment is strictly prohibited.</li>
          <li><strong>Original Content:</strong> Write authentic stories. Give attribution when referencing external sources or code.</li>
          <li><strong>No Spam:</strong> Avoid publishing clickbait or purely promotional non-substantive content.</li>
          <li><strong>Keep it Safe:</strong> Do not post hate speech, unsafe links, or harmful material.</li>
        </ul>
      </div>
    ),
  },
  '/help': {
    title: 'Help & Support Center',
    subtitle: 'Find answers to common questions and learn how to use the platform.',
    icon: HelpCircle,
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h4 className="font-bold text-gray-900 dark:text-white">How do I format my blog post?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">We support standard Markdown formatting including headers, code blocks with syntax highlighting, lists, and images.</p>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h4 className="font-bold text-gray-900 dark:text-white">Can I edit or delete my stories after publishing?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Yes! Navigate to your Profile or Story Dashboard to edit, manage, or delete your posts anytime.</p>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h4 className="font-bold text-gray-900 dark:text-white">How does the AI Assistant work?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Click the AI Assistant button in the Story Editor to generate blog post ideas, full drafts, or suggested tags instantly using Gemini AI.</p>
          </div>
        </div>
      </div>
    ),
  },
  '/privacy': {
    title: 'Privacy Policy',
    subtitle: 'How we collect, protect, and respect your privacy.',
    icon: Shield,
    content: (
      <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
        <p>Your privacy is important to us. We only collect essential information such as your display name, email address, and profile settings necessary to provide authentication and personalized features.</p>
        <p>We do not sell your personal data to third parties. All authentication credentials are encrypted and secured via Firebase Authentication.</p>
      </div>
    ),
  },
  '/terms': {
    title: 'Terms of Service',
    subtitle: 'Terms governing your use of Fav Animals.',
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
        <p>By using Fav Animals, you agree to comply with our community guidelines and terms of service. You retain full ownership of the content you publish on our platform.</p>
        <p>We reserve the right to moderate or remove content that violates our terms or safety policies.</p>
      </div>
    ),
  },
  '/newsletter': {
    title: 'Newsletter Subscription',
    subtitle: 'Get top weekly stories delivered directly to your inbox.',
    icon: Mail,
    content: (
      <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center space-y-4">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Subscribe to receive curated digests of trending articles and developer insights every week.</p>
        <div className="max-w-md mx-auto flex gap-2">
          <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm dark:text-white focus:outline-none" />
          <button className="px-5 py-2 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700">Subscribe</button>
        </div>
      </div>
    ),
  },
  '/events': {
    title: 'Community Events',
    subtitle: 'Join upcoming writing hackathons, webinars, and live discussions.',
    icon: Calendar,
    content: (
      <div className="space-y-4">
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-900 dark:text-white">Summer Story Hackathon 2026</h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium">Upcoming</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Write tech tutorials & animal stories to win featured homepage spots and community badges.</p>
        </div>
      </div>
    ),
  },
  '/careers': {
    title: 'Work With Us',
    subtitle: 'Help build the next generation of creative publishing tools.',
    icon: Briefcase,
    content: (
      <div className="text-center py-8 space-y-4">
        <p className="text-gray-600 dark:text-gray-400">We are always looking for passionate engineers, designers, and community builders.</p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">Current openings: Senior Frontend Engineer, Community Manager</p>
      </div>
    ),
  },
};

export const SubPage: React.FC = () => {
  const location = useLocation();
  const data = PAGE_DATA[location.pathname] || {
    title: 'Information Page',
    subtitle: 'Page details and context.',
    icon: Info,
    content: <p className="text-gray-600 dark:text-gray-400">Welcome to Fav Animals platform pages.</p>,
  };

  const Icon = data.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="flex items-center gap-6 p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Icon className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{data.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            {data.subtitle}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        {data.content}
      </motion.div>
    </div>
  );
};

