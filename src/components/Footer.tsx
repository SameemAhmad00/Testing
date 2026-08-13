import { Link } from "react-router";
import { BookOpen, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: "Latest Stories", href: "/" },
      { name: "Trending", href: "/search?q=trending" },
      { name: "Write a Story", href: "/create" },
      { name: "Search", href: "/search" },
    ],
    Community: [
      { name: "Guidelines", href: "/guidelines" },
      { name: "Help Center", href: "/help" },
      { name: "Newsletter", href: "/newsletter" },
      { name: "Events", href: "/events" },
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "GitHub", icon: Github, href: "https://github.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  ];

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-indigo-600 rounded-xl p-1.5 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Fav Animals
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed text-sm">
              A modern publishing platform for writers, developers, and creators. Share your thoughts with the world.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-6">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Fav Animals. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for creators worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
