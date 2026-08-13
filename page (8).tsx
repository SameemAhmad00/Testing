'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', background: 'var(--color-background)',
    color: 'var(--color-text)', fontSize: '0.9375rem', fontFamily: 'var(--font-ui)',
    outline: 'none', transition: 'border-color 150ms ease-out',
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '0.5rem' }}>Contact Us</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem', fontSize: '1.0625rem' }}>Have a question or want to contribute? We&apos;d love to hear from you.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '4rem', flexWrap: 'wrap' }}>
        {/* Info */}
        <div>
          {[
            { icon: Mail, title: 'Email', text: 'hello@problog.com' },
            { icon: MapPin, title: 'Location', text: 'Remote First — Worldwide' },
            { icon: Clock, title: 'Response Time', text: 'Within 24 hours' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ padding: '0.75rem', background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', borderRadius: 'var(--radius-md)' }}>
                <Icon size={20} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={inputStyle} placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required style={inputStyle} placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>Subject *</label>
            <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required style={inputStyle} placeholder="What&apos;s this about?" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>Message *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us more..." />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '0.875rem 2rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem', alignSelf: 'flex-start', transition: 'opacity 150ms', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
