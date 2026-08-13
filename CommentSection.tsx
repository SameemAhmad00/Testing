'use client';

import { useState } from 'react';
import { Comment, createComment } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
  postId: string;
  postTitle: string;
  initialComments: Comment[];
}

function formatDate(ts: unknown): string {
  try {
    const date = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch { return ''; }
}

export function CommentSection({ postId, postTitle, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await createComment({ postId, postTitle, name: name.trim(), email: email.trim(), content: content.trim(), status: 'pending' });
      setSubmitted(true);
      setName('');
      setEmail('');
      setContent('');
      toast.success('Comment submitted! It will appear after approval.');
    } catch {
      toast.error('Failed to submit comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', background: 'var(--color-background)',
    color: 'var(--color-text)', fontSize: '0.9375rem', fontFamily: 'var(--font-ui)',
    outline: 'none', transition: 'border-color 150ms ease-out',
  };

  return (
    <section>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.375rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        <MessageCircle size={22} style={{ color: 'var(--color-accent)' }} />
        Comments {comments.length > 0 && <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>({comments.length})</span>}
      </h2>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          Be the first to leave a comment!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {comments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: '1.25rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1 }}>{comment.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{formatDate(comment.createdAt)}</p>
                </div>
              </div>
              <p style={{ color: 'var(--color-text)', fontSize: '0.9375rem', lineHeight: 1.65 }}>{comment.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>Leave a Comment</h3>
        <AnimatePresence>
          {submitted ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-success)' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>✓ Thank you for your comment!</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Your comment will appear after moderation.</p>
              <button onClick={() => setSubmitted(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                Add another comment
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>Comment *</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required placeholder="Share your thoughts..." rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 600, alignSelf: 'flex-start', transition: 'opacity 150ms', opacity: loading ? 0.7 : 1 }}
              >
                <Send size={16} /> {loading ? 'Submitting...' : 'Submit Comment'}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Comments are moderated and will appear after approval.</p>
            </form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
