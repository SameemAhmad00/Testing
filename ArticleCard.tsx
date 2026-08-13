'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  post: Post;
  featured?: boolean;
}

function formatDate(ts: unknown): string {
  try {
    const date = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
}

export function ArticleCard({ post, featured = false }: ArticleCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        background: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: featured ? 'row' : 'column',
        height: '100%',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s ease-out, border-color 0.2s ease-out',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Image */}
      <Link
        href={`/blog/${post.slug}`}
        style={{
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          ...(featured ? { width: '45%', minHeight: '280px' } : { height: '200px' }),
        }}
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.3s ease-out' }}
            className="card-img"
            sizes={featured ? '45vw' : '(max-width: 640px) 100vw, 33vw'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>📝</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category */}
        {post.categoryName && (
          <Link href={`/category/${post.categorySlug}`} style={{ display: 'inline-block', marginBottom: '0.625rem' }}>
            <span style={{
              fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: 'var(--color-accent)', textDecoration: 'none',
            }}>
              {post.categoryName}
            </span>
          </Link>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', marginBottom: '0.625rem' }}>
          <h2
            style={{
              fontSize: featured ? '1.375rem' : '1.0625rem',
              fontWeight: 700,
              lineHeight: 1.3,
              color: 'var(--color-text)',
              transition: 'color 0.15s ease-out',
              fontFamily: 'var(--font-ui)',
            }}
            className="card-title"
          >
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className={`line-clamp-${featured ? '3' : '2'}`} style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-surface-2)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1 }}>
              {post.authorName || 'Unknown'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              <span>{formatDate(post.publishedAt)}</span>
              {post.readingTime && (
                <>
                  <span>·</span>
                  <Clock size={11} />
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .card-img:hover { transform: scale(1.04); }
        .card-title:hover { color: var(--color-accent) !important; }
      `}</style>
    </motion.article>
  );
}
