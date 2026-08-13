'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchPosts, Post } from '@/lib/firestore';
import { ArticleCard } from '@/components/public/ArticleCard';
import { Search, Loader2 } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams]);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const r = await searchPosts(term);
      setResults(r);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      doSearch(query.trim());
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '2rem' }}>Search Articles</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', maxWidth: '600px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, topics, authors..."
            autoFocus
            style={{
              width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
              borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-border)',
              background: 'var(--color-background)', color: 'var(--color-text)',
              fontSize: '1rem', fontFamily: 'var(--font-ui)', outline: 'none',
              transition: 'border-color 150ms ease-out',
            }}
            onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'}
            onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
          />
        </div>
        <button type="submit" style={{ padding: '0.875rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>
          Search
        </button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Searching...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : searched ? (
        <>
          {results.length > 0 ? (
            <>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for &ldquo;<strong>{query}</strong>&rdquo;
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {results.map(post => <ArticleCard key={post.id} post={post} />)}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>No results found</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>No articles matched &ldquo;<strong>{query}</strong>&rdquo;. Try different keywords.</p>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
          <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.125rem' }}>Enter a keyword to search for articles</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '3rem 1.5rem' }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
