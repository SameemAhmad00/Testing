import type { Metadata } from 'next';
import { getPublishedPosts, getCategories } from '@/lib/firestore';
import { ArticleCard } from '@/components/public/ArticleCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — All Articles',
  description: 'Browse all articles. Discover technology, design, business, and more.',
};

export const revalidate = 60;

interface BlogPageProps {
  searchParams: Promise<{ category?: string; tag?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const [posts, categories] = await Promise.all([
    getPublishedPosts(12),
    getCategories(),
  ]);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
          All Articles
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem' }}>
          {posts.length} articles and counting
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/blog" style={{
            padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600,
            textDecoration: 'none', background: !params.category ? 'var(--color-accent)' : 'var(--color-surface)',
            color: !params.category ? '#fff' : 'var(--color-text-muted)', border: '1px solid var(--color-border)',
            transition: 'all 150ms ease-out',
          }}>
            All
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/blog?category=${cat.slug}`} style={{
              padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500,
              textDecoration: 'none', background: params.category === cat.slug ? 'var(--color-accent)' : 'var(--color-surface)',
              color: params.category === cat.slug ? '#fff' : 'var(--color-text-muted)', border: '1px solid var(--color-border)',
              transition: 'all 150ms ease-out',
            }}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No articles found</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Check back soon — great content is on the way!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {posts.map(post => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
