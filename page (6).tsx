import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, getPublishedPosts, incrementPostViews, getCommentsByPost, getAuthorById } from '@/lib/firestore';
import { ReadingProgress } from '@/components/public/ReadingProgress';
import { ShareButtons } from '@/components/public/ShareButtons';
import { NewsletterForm } from '@/components/public/NewsletterForm';
import { ArticleCard } from '@/components/public/ArticleCard';
import { CommentSection } from '@/components/public/CommentSection';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, User, ChevronRight, Calendar } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt },
  };
}

function formatPubDate(ts: unknown): string {
  try {
    const date = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return format(date, 'MMMM d, yyyy');
  } catch { return ''; }
}

export const revalidate = 60;

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'published') notFound();

  const [relatedPosts, comments, author] = await Promise.all([
    getPublishedPosts(3),
    getCommentsByPost(post.id!),
    post.authorId ? getAuthorById(post.authorId) : Promise.resolve(null),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://problog.vercel.app';
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <>
      <ReadingProgress />

      <article style={{ paddingBottom: '4rem' }}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="container" style={{ paddingTop: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <Link href="/blog" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Blog</Link>
            {post.categoryName && (
              <>
                <ChevronRight size={14} />
                <Link href={`/category/${post.categorySlug}`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>{post.categoryName}</Link>
              </>
            )}
          </nav>

          {/* Category */}
          {post.categoryName && (
            <Link href={`/category/${post.categorySlug}`} style={{ display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)' }}>
                {post.categoryName}
              </span>
            </Link>
          )}

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1rem', fontFamily: 'var(--font-ui)' }}>
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p style={{ fontSize: '1.1875rem', color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              {post.excerpt}
            </p>
          )}

          {/* Author + Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-surface-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {author?.avatar ? <Image src={author.avatar} alt={author.name} width={44} height={44} style={{ objectFit: 'cover' }} /> : <User size={20} style={{ color: 'var(--color-text-muted)' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1, marginBottom: '0.25rem' }}>
                {author?.name || post.authorName || 'Unknown Author'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} />
                  <span>{formatPubDate(post.publishedAt)}</span>
                </div>
                {post.readingTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    <span>{post.readingTime} min read</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Featured Image ───────────────────────────────────────────── */}
        {post.featuredImage && (
          <div style={{ margin: '2.5rem auto', maxWidth: '900px', padding: '0 1.5rem' }}>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                fill
                priority
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 900px) 100vw, 900px"
              />
            </div>
          </div>
        )}

        {/* ── Floating Share (desktop only) ─────────────────────────── */}
        <ShareButtons url={articleUrl} title={post.title} variant="floating" />

        {/* ── Article Content ──────────────────────────────────────── */}
        <div
          className="prose container"
          style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: '0 1.5rem' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ── Share + Tags ─────────────────────────────────────────── */}
        <div className="container" style={{ maxWidth: 'var(--content-width)', margin: '3rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Tags:</span>
                {post.tags.map(tag => (
                  <Link key={tag} href={`/tag/${tag}`} style={{
                    padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'all 150ms ease-out',
                  }}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons url={articleUrl} title={post.title} variant="horizontal" />
          </div>
        </div>

        {/* ── Author Card ──────────────────────────────────────────── */}
        {author && (
          <div className="container" style={{ maxWidth: 'var(--content-width)', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--color-border)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {author.avatar ? <Image src={author.avatar} alt={author.name} width={72} height={72} style={{ objectFit: 'cover' }} /> : <User size={28} style={{ color: 'var(--color-text-muted)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', marginBottom: '0.25rem' }}>Written by</p>
                <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{author.name}</h3>
                {author.jobTitle && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{author.jobTitle}</p>}
                {author.bio && <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{author.bio}</p>}
                <Link href={`/author/${author.slug}`} style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}>
                  View all articles →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Newsletter CTA ────────────────────────────────────────── */}
        <div className="container" style={{ maxWidth: 'var(--content-width)', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
          <NewsletterForm variant="article" />
        </div>

        {/* ── Comments ─────────────────────────────────────────────── */}
        <div className="container" style={{ maxWidth: 'var(--content-width)', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
          <CommentSection postId={post.id!} postTitle={post.title} initialComments={comments} />
        </div>

        {/* ── Related Articles ──────────────────────────────────────── */}
        {relatedPosts.filter(p => p.id !== post.id).length > 0 && (
          <section className="container" style={{ marginTop: '4rem', padding: '0 1.5rem' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '1.5rem' }}>You might also like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {relatedPosts.filter(p => p.id !== post.id).slice(0, 3).map(rp => (
                <ArticleCard key={rp.id} post={rp} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
