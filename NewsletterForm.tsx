'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { addSubscriber } from '@/lib/firestore';
import { Mail } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'inline' | 'hero' | 'article';
}

export function NewsletterForm({ variant = 'inline' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await addSubscriber(email.trim(), '', 'newsletter-' + variant);
      setDone(true);
      setEmail('');
      toast.success('Welcome aboard! Check your inbox.');
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'hero') {
    return (
      <section style={{
        background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 70%, #7c3aed) 100%)',
        padding: '4rem 1.5rem',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.15)', borderRadius: '50%' }}>
              <Mail size={28} style={{ color: '#fff' }} />
            </div>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Stay informed.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.0625rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Get our best articles delivered to your inbox weekly. No spam, ever.
          </p>
          {done ? (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-lg)', color: '#fff', fontWeight: 600 }}>
              ✓ You&apos;re subscribed! Check your inbox to confirm.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '440px', margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  flex: 1, padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                  border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '1rem', fontFamily: 'var(--font-ui)', outline: 'none',
                }}
              />
              <button type="submit" disabled={loading}
                style={{
                  padding: '0.875rem 1.5rem', background: '#fff', color: 'var(--color-accent)',
                  borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
                  fontSize: '0.9375rem', fontWeight: 700, whiteSpace: 'nowrap',
                  transition: 'opacity 150ms ease-out',
                }}
              >
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'article') {
    return (
      <div style={{
        background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
        padding: '2rem', border: '1px solid var(--color-border)', textAlign: 'center',
      }}>
        <Mail size={24} style={{ color: 'var(--color-accent)', marginBottom: '0.75rem' }} />
        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Enjoyed this article?</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
          Subscribe to get articles like this in your inbox.
        </p>
        {done ? (
          <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ You&apos;re subscribed!</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                flex: 1, padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-background)',
                color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', outline: 'none',
              }}
            />
            <button type="submit" disabled={loading}
              style={{
                padding: '0.625rem 1.25rem', background: 'var(--color-accent)', color: '#fff',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              {loading ? '...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {done ? (
        <p style={{ color: 'var(--color-success)', fontWeight: 500, fontSize: '0.875rem' }}>✓ Subscribed!</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              flex: 1, minWidth: '160px', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'var(--color-background)',
              color: 'var(--color-text)', fontSize: '0.875rem', fontFamily: 'var(--font-ui)', outline: 'none',
            }}
          />
          <button type="submit" disabled={loading}
            style={{
              padding: '0.625rem 1rem', background: 'var(--color-accent)', color: '#fff',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600,
            }}
          >
            {loading ? '...' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}
