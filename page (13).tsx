'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPosts, getCategories, getSubscribers, getComments, getAnalytics } from '@/lib/firestore';
import { Post, Comment, Subscriber } from '@/lib/firestore';
import { Eye, FileText, Users, MessageSquare, TrendingUp, Plus, BarChart, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBar, Bar } from 'recharts';
import { format } from 'date-fns';

function StatCard({ label, value, icon: Icon, trend, color }: { label: string; value: string; icon: React.ComponentType<{size?: number; style?: React.CSSProperties}>; trend?: string; color: string }) {
  return (
    <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{label}</p>
        <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color: 'var(--color-text)' }}>{value}</p>
        {trend && <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '0.375rem', fontWeight: 600 }}>{trend}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, c, s, a] = await Promise.all([
          getPosts(),
          getComments(),
          getSubscribers(),
          getAnalytics(14),
        ]);
        setPosts(p);
        setComments(c);
        setSubscribers(s);
        setAnalytics(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const published = posts.filter(p => p.status === 'published');
  const drafts = posts.filter(p => p.status === 'draft');
  const pending = comments.filter(c => c.status === 'pending');
  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);

  const chartData = analytics.map(d => ({
    date: format(new Date(d.date as string), 'MMM d'),
    views: (d.page_view as number) || 0,
    articles: (d.article_view as number) || 0,
  }));

  const recentPosts = posts.sort((a, b) => {
    const ta = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    const tb = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    return tb - ta;
  }).slice(0, 5);

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Welcome back! Here&apos;s an overview of your blog.</p>
        </div>
        <Link href="/admin/posts/new" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-lg)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem' }}>
          <Plus size={18} /> New Post
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="#2563EB" trend={`${published.length} published articles`} />
        <StatCard label="Articles" value={posts.length.toString()} icon={FileText} color="#7c3aed" trend={`${drafts.length} drafts`} />
        <StatCard label="Subscribers" value={subscribers.length.toLocaleString()} icon={Users} color="#059669" trend={`${subscribers.filter(s => s.status === 'active').length} active`} />
        <StatCard label="Comments" value={comments.length.toString()} icon={MessageSquare} color="#d97706" trend={pending.length > 0 ? `${pending.length} pending review` : 'All reviewed'} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Views chart */}
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Views — Last 14 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }} />
              <Line type="monotone" dataKey="views" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top articles */}
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BarChart size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Top Articles by Views</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {published.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((post, i) => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 900, color: 'var(--color-border)', width: '20px', textAlign: 'center', flexShrink: 0 }}>0{i + 1}</span>
                <Link href={`/admin/posts/${post.id}/edit`} className="line-clamp-1" style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500 }}>{post.title}</Link>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0, fontWeight: 600 }}>{(post.viewCount || 0).toLocaleString()}</span>
              </div>
            ))}
            {published.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No published articles yet</p>}
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Posts</h2>
          <Link href="/admin/posts" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Title', 'Status', 'Category', 'Views', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '0.75rem', maxWidth: '280px' }}>
                    <span className="line-clamp-1" style={{ fontWeight: 600, color: 'var(--color-text)' }}>{post.title}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
                      background: post.status === 'published' ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : post.status === 'draft' ? 'color-mix(in srgb, var(--color-warning) 15%, transparent)' : 'var(--color-surface)',
                      color: post.status === 'published' ? 'var(--color-success)' : post.status === 'draft' ? 'var(--color-warning)' : 'var(--color-text-muted)',
                    }}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{post.categoryName || '—'}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{(post.viewCount || 0).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <Link href={`/admin/posts/${post.id}/edit`} style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>Edit</Link>
                  </td>
                </tr>
              ))}
              {recentPosts.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No posts yet. <Link href="/admin/posts/new" style={{ color: 'var(--color-accent)' }}>Create your first post →</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
