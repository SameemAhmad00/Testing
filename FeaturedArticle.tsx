'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/firestore';
import { Clock, User, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function formatDate(ts: unknown): string {
  try {
    const date = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch { return ''; }
}

export function FeaturedArticle({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'var(--color-surface)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          cursor: 'pointer',
        }}
        className="featured-hero"
      >
        {/* Background Image */}
        {post.featuredImage && (
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            fill
            priority
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease-out' }}
            className="featured-img"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        )}

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
          zIndex: 1,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem' }}>
          {post.categoryName && (
            <span style={{
              display: 'inline-block', padding: '0.25rem 0.75rem',
              background: 'var(--color-accent)', color: '#fff',
              borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem',
            }}>
              {post.categoryName}
            </span>
          )}

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.15,
            color: '#fff', marginBottom: '0.75rem', fontFamily: 'var(--font-ui)',
          }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '580px' }}>
              {post.excerpt}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)' }}>
              <User size={14} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{post.authorName || 'Unknown'}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{formatDate(post.publishedAt)}</span>
            {post.readingTime && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Clock size={13} />
                  <span style={{ fontSize: '0.875rem' }}>{post.readingTime} min read</span>
                </div>
              </>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 1rem', background: '#fff', color: '#000',
              borderRadius: 'var(--radius-full)', fontSize: '0.8125rem', fontWeight: 700,
              marginLeft: 'auto',
            }}>
              Read Article <ArrowRight size={14} />
            </span>
          </div>
        </div>

        <style>{`
          .featured-hero:hover .featured-img { transform: scale(1.03); }
        `}</style>
      </article>
    </Link>
  );
}
