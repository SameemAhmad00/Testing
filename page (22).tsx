'use client';

import { useEffect, useState } from 'react';
import { getPostById } from '@/lib/firestore';
import { PostEditor } from '@/components/admin/PostEditor';
import { Post } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState('');

  useEffect(() => {
    params.then(async ({ id: postId }) => {
      setId(postId);
      const p = await getPostById(postId);
      setPost(p);
      setLoading(false);
    });
  }, [params]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
      <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!post) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>Post not found</p>
    </div>
  );

  return <PostEditor initialPost={post} postId={id} />;
}
