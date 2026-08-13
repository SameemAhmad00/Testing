import type { Metadata } from 'next';
import { getPublishedPosts, getFeaturedPosts, getCategories } from '@/lib/firestore';
import { FeaturedArticle } from '@/components/public/FeaturedArticle';
import { ArticleCard } from '@/components/public/ArticleCard';
import { NewsletterForm } from '@/components/public/NewsletterForm';
import Link from 'next/link';
import { ArrowRight, TrendingUp, BookOpen, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ProBlog — Professional Publishing Platform',
  description: 'Discover high-quality articles on technology, design, business, and more.',
};

export const revalidate = 60;

export default async function HomePage() {
  const [latestPosts, featuredPosts, categories] = await Promise.all([
    getPublishedPosts(9),
    getFeaturedPosts(3),
    getCategories(),
  ]);

  const heroPost = featuredPosts[0] || latestPosts[0];
  const gridPosts = latestPosts.slice(0, 6);
  const popularPosts = featuredPosts;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      {heroPost && (
        <section className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
          <FeaturedArticle post={heroPost} />
        </section>
      )}

      {/* ── Latest Articles ───────────────────────────────────────────── */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={22} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-ui)' }}>Latest Articles</h2>
          </div>
          <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {gridPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No articles yet.</p>
            <p style={{ fontSize: '0.9rem' }}>Check back soon — great content is coming!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {gridPosts.map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* ── Popular Articles ──────────────────────────────────────────── */}
      {popularPosts.length > 0 && (
        <section style={{ background: 'var(--color-surface)', padding: '4rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <TrendingUp size={22} style={{ color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-ui)' }}>Trending Articles</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {popularPosts.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: 'var(--color-background)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', transition: 'all 200ms ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}
                >
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-border)', width: '2.5rem', flexShrink: 0, textAlign: 'center', lineHeight: 1 }}>0{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {post.categoryName && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.categoryName}</span>}
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.3, marginTop: '0.25rem' }} className="line-clamp-2">{post.title}</h3>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{post.viewCount?.toLocaleString() || 0} views</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Categories ────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="container" style={{ padding: '4rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Layers size={22} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-ui)' }}>Browse Categories</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {categories.map((cat, i) => {
              const palette = ['#2563EB', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
              const color = palette[i % palette.length];
              return (
                <Link key={cat.id} href={`/category/${cat.slug}`} style={{ textDecoration: 'none', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', background: 'var(--color-background)', transition: 'all 200ms ease-out', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: color }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{cat.postCount || 0} articles</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Newsletter CTA ────────────────────────────────────────────── */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <NewsletterForm variant="hero" />
      </section>
    </div>
  );
}
