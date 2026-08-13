import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAuthorBySlug, getPostsByAuthor } from '@/lib/firestore';
import { ArticleCard } from '@/components/public/ArticleCard';
import { Twitter, Linkedin, Globe, User } from 'lucide-react';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: 'Author Not Found' };
  return {
    title: `${author.name} — Author`,
    description: author.bio || `Articles by ${author.name}`,
  };
}

export const revalidate = 60;

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const [author, posts] = await Promise.all([
    getAuthorBySlug(slug),
    getAuthorBySlug(slug).then(a => a ? getPostsByAuthor(a.id!, 12) : []),
  ]);
  if (!author) notFound();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Author Profile */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingBottom: '3rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          {author.avatar ? (
            <Image src={author.avatar} alt={author.name} width={100} height={100} style={{ objectFit: 'cover' }} />
          ) : (
            <User size={36} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.375rem' }}>{author.name}</h1>
        {author.jobTitle && <p style={{ fontSize: '1rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '0.75rem' }}>{author.jobTitle}</p>}
        {author.bio && <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto 1.25rem' }}>{author.bio}</p>}

        {/* Social Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {author.website && (
            <a href={author.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
              <Globe size={14} /> Website
            </a>
          )}
          {author.twitter && (
            <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
              <Twitter size={14} /> Twitter
            </a>
          )}
          {author.linkedin && (
            <a href={`https://linkedin.com/in/${author.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
              <Linkedin size={14} /> LinkedIn
            </a>
          )}
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{posts.length} articles published</p>
      </div>

      {/* Articles */}
      <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '1.5rem' }}>Articles by {author.name}</h2>
      {posts.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem' }}>No articles published yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {posts.map(post => <ArticleCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}
