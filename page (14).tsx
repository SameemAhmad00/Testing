'use client';

import { useEffect, useState } from 'react';
import { getAnalytics, getPublishedPosts, getSubscribers, getComments, Post } from '@/lib/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Eye, Users, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const PERIODS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

const COLORS = ['#2563EB', '#7c3aed', '#059669', '#d97706', '#dc2626'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [analytics, setAnalytics] = useState<Record<string, unknown>[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [subsCount, setSubsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [period]);

  async function load() {
    setLoading(true);
    try {
      const [a, p, s, c] = await Promise.all([
        getAnalytics(period),
        getPublishedPosts(50),
        getSubscribers(),
        getComments(),
      ]);
      setAnalytics(a);
      setPosts(p);
      setSubsCount(s.length);
      setCommentsCount(c.length);
    } finally { setLoading(false); }
  }

  const chartData = analytics.map(d => ({
    date: format(new Date(d.date as string), period <= 30 ? 'MMM d' : 'MMM d'),
    pageViews: (d.page_view as number) || 0,
    articleViews: (d.article_view as number) || 0,
  }));

  const totalViews = analytics.reduce((sum, d) => sum + ((d.page_view as number) || 0), 0);
  const totalArticleViews = analytics.reduce((sum, d) => sum + ((d.article_view as number) || 0), 0);

  const topPosts = [...posts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 10);

  const categoryData = posts.reduce<Record<string, number>>((acc, post) => {
    const cat = post.categoryName || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + (post.viewCount || 0);
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Analytics</h1>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {PERIODS.map(({ label, days }) => (
            <button key={days} onClick={() => setPeriod(days)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: period === days ? 'var(--color-accent)' : 'var(--color-surface)', color: period === days ? '#fff' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Page Views', value: totalViews.toLocaleString(), icon: Eye, color: '#2563EB' },
              { label: 'Article Views', value: totalArticleViews.toLocaleString(), icon: TrendingUp, color: '#7c3aed' },
              { label: 'Subscribers', value: subsCount.toLocaleString(), icon: Users, color: '#059669' },
              { label: 'Comments', value: commentsCount.toLocaleString(), icon: MessageSquare, color: '#d97706' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: `${color}18`, borderRadius: 'var(--radius-md)' }}><Icon size={20} style={{ color }} /></div>
                <div><p style={{ fontSize: '1.625rem', fontWeight: 900, lineHeight: 1 }}>{value}</p><p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{label}</p></div>
              </div>
            ))}
          </div>

          {/* Views chart */}
          <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--color-accent)' }} /> Page Views Over Time
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="pageViews" stroke="#2563EB" strokeWidth={2.5} dot={false} name="Page Views" />
                <Line type="monotone" dataKey="articleViews" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="Article Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Top articles bar */}
            <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Top Articles by Views</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topPosts.slice(0, 5).map(p => ({ name: p.title.slice(0, 20) + (p.title.length > 20 ? '…' : ''), views: p.viewCount || 0 }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }} />
                  <Bar dataKey="views" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category pie */}
            {pieData.length > 0 && (
              <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Views by Category</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top articles table */}
          <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Top Articles</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                {['#', 'Title', 'Category', 'Views', 'Reading Time'].map(h => <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {topPosts.map((post, i) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, maxWidth: '300px' }} className="line-clamp-1">{post.title}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{post.categoryName || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-accent)' }}>{(post.viewCount || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{post.readingTime ? `${post.readingTime} min` : '—'}</td>
                  </tr>
                ))}
                {topPosts.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No published articles yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
