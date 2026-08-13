import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPostsByCategory, getCategories } from '@/lib/firestore';
import { ArticleCard } from '@/components/public/ArticleCard';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.seoTitle || category.name} — Category`,
    description: category.seoDescription || category.description || `Browse all articles in ${category.name}`,
  };
}

export const revalidate = 60;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, posts, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getPostsByCategory(slug, 12),
    getCategories(),
  ]);
  if (!category) notFound();

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={14} />
        <Link href="/categories" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Categories</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-text)' }}>{category.name}</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '0.75rem' }}>{category.name}</h1>
        {category.description && (
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: '600px' }}>{category.description}</p>
        )}
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{posts.length} articles</p>
      </div>

      {/* Other categories */}
      {allCategories.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {allCategories.filter(c => c.slug !== slug).map(cat => (
            <Link key={cat.id} href={`/category/${cat.slug}`} style={{ padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', background: 'var(--color-surface)', color: 'var(--color-text-muted)', textDecoration: 'none', border: '1px solid var(--color-border)', transition: 'all 150ms ease-out' }}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</p>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No articles yet</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>No articles in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {posts.map(post => <ArticleCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}
