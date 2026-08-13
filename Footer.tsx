'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Instagram, Youtube, Mail } from 'lucide-react';
import { useState } from 'react';
import { addSubscriber } from '@/lib/firestore';
import toast from 'react-hot-toast';

const footerLinks = {
  Explore: [
    { href: '/blog', label: 'Blog' },
    { href: '/categories', label: 'Categories' },
    { href: '/authors', label: 'Authors' },
    { href: '/about', label: 'About' },
  ],
  Resources: [
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

const social = [
  { href: 'https://twitter.com', icon: Twitter, label: 'X / Twitter' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await addSubscriber(email.trim(), '', 'footer');
      setDone(true);
      setEmail('');
      toast.success('You\'re subscribed! 🎉');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', marginTop: '4rem' }}>
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem' }}>P</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>ProBlog</span>
            </Link>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.6', maxWidth: '220px' }}>
              A professional publishing platform for modern readers and thoughtful writers.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              {social.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease-out', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--color-accent) 10%, transparent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {section}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 150ms' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Newsletter
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              Get the best articles delivered to your inbox.
            </p>
            {done ? (
              <p style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500 }}>✓ You&apos;re subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)', background: 'var(--color-background)',
                    color: 'var(--color-text)', fontSize: '0.875rem', outline: 'none',
                    fontFamily: 'var(--font-ui)',
                  }}
                />
                <button type="submit" disabled={loading}
                  style={{ padding: '0.625rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'opacity 150ms' }}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2.5rem', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} ProBlog. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
