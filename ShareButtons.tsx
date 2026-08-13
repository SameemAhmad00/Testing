'use client';

import { Twitter, Facebook, Linkedin, Link2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  url: string;
  title: string;
  variant?: 'floating' | 'horizontal';
}

export function ShareButtons({ url, title, variant = 'horizontal' }: ShareButtonsProps) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      label: 'Share on X/Twitter',
      icon: Twitter,
      color: '#000',
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      label: 'Share on Facebook',
      icon: Facebook,
      color: '#1877F2',
    },
    {
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      label: 'Share on LinkedIn',
      icon: Linkedin,
      color: '#0A66C2',
    },
    {
      href: `mailto:?subject=${encodedTitle}&body=${encoded}`,
      label: 'Share via Email',
      icon: Mail,
      color: '#6B7280',
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  if (variant === 'floating') {
    return (
      <div style={{
        position: 'fixed', left: '1.5rem', top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 50,
      }} className="share-floating">
        {links.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            style={{
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)',
              textDecoration: 'none', transition: 'all 150ms ease-out',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
          >
            <Icon size={16} />
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="Copy link"
          style={{
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)',
            cursor: 'pointer', transition: 'all 150ms ease-out',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
        >
          <Link2 size={16} />
        </button>
        <style>{`@media (max-width: 1280px) { .share-floating { display: none; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '0.25rem' }}>Share:</span>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          style={{
            padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)',
            textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500, transition: 'all 150ms ease-out',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
        >
          <Icon size={14} />
          {label.split(' on ')[1] || label.split(' via ')[1]}
        </a>
      ))}
      <button
        onClick={copyLink}
        style={{
          padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)',
          cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, transition: 'all 150ms ease-out',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
      >
        <Link2 size={14} /> Copy link
      </button>
    </div>
  );
}
