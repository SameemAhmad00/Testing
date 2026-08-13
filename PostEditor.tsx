'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Post, createPost, updatePost, getCategories, getTags, getAuthors, slugify, estimateReadingTime, addMedia } from '@/lib/firestore';
import type { Category, Tag, Author } from '@/lib/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import {
  Bold, Italic, UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, AlignLeft, AlignCenter, AlignRight, Link2, Image as ImgIcon,
  Eye, ArrowLeft, Save, Upload, X, Loader2
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface PostEditorProps {
  initialPost?: Post;
  postId?: string;
}

const ToolbarButton = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      padding: '0.375rem', borderRadius: 'var(--radius-sm)', background: active ? 'var(--color-accent)' : 'transparent',
      color: active ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 100ms',
    }}
    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; }}
    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
  >
    {children}
  </button>
);

export function PostEditor({ initialPost, postId }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [slug, setSlugVal] = useState(initialPost?.slug || '');
  const [slugEdited, setSlugEdited] = useState(false);
  const [categoryId, setCategoryId] = useState(initialPost?.categoryId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialPost?.tags || []);
  const [featuredImage, setFeaturedImage] = useState(initialPost?.featuredImage || '');
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialPost?.featuredImageAlt || '');
  const [status, setStatus] = useState<Post['status']>(initialPost?.status || 'draft');
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || '');
  const [seoDesc, setSeoDesc] = useState(initialPost?.seoDescription || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorId, setAuthorId] = useState(initialPost?.authorId || '');
  const [saving, setSaving] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialPost?.content || '',
    editorProps: {
      attributes: {
        class: 'prose-editor',
        style: 'min-height: 400px; outline: none; padding: 1.5rem; font-family: var(--font-ui); font-size: 1rem; line-height: 1.7; color: var(--color-text);',
      },
    },
  });

  useEffect(() => {
    async function load() {
      const [c, t, a] = await Promise.all([getCategories(), getTags(), getAuthors()]);
      setCategories(c);
      setTags(t);
      setAuthors(a);
    }
    load();
  }, []);

  // Auto-slug from title
  useEffect(() => {
    if (!slugEdited && title) setSlugVal(slugify(title));
  }, [title, slugEdited]);

  const getPostData = useCallback((): Omit<Post, 'id'> => {
    const content = editor?.getHTML() || '';
    const category = categories.find(c => c.id === categoryId);
    const author = authors.find(a => a.id === authorId);
    return {
      title, slug, excerpt, content,
      featuredImage, featuredImageAlt,
      categoryId, categoryName: category?.name, categorySlug: category?.slug,
      tags: selectedTags, authorId, authorName: author?.name,
      status, seoTitle, seoDescription: seoDesc,
      readingTime: estimateReadingTime(content),
      publishedAt: status === 'published' ? (initialPost?.publishedAt || Timestamp.now()) : null,
    };
  }, [title, slug, excerpt, editor, featuredImage, featuredImageAlt, categoryId, selectedTags, authorId, status, seoTitle, seoDesc, categories, authors, initialPost]);

  // Autosave (debounced)
  useEffect(() => {
    if (!postId || !title) return;
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      setAutoSaveMsg('Saving...');
      try {
        await updatePost(postId, { ...getPostData(), status: 'draft' });
        setAutoSaveMsg('Saved ' + new Date().toLocaleTimeString());
      } catch { setAutoSaveMsg('Save failed'); }
    }, 3000);
    return () => clearTimeout(autoSaveRef.current);
  }, [title, excerpt, slug, seoTitle, seoDesc, selectedTags, categoryId, authorId, postId, getPostData]);

  const handleSave = async (newStatus?: Post['status']) => {
    if (!title.trim()) { toast.error('Please enter a title.'); return; }
    setSaving(true);
    try {
      const data = { ...getPostData(), status: newStatus || status };
      if (postId) {
        await updatePost(postId, data);
        toast.success(newStatus === 'published' ? 'Article published!' : 'Draft saved.');
      } else {
        const id = await createPost(data);
        toast.success('Article created!');
        router.replace(`/admin/posts/${id}/edit`);
      }
      if (newStatus) setStatus(newStatus);
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `media/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    return new Promise((res, rej) => {
      task.on('state_changed', null, rej, async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addMedia({ url, filename: file.name, type: file.type, size: file.size });
        res(url);
      });
    });
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const url = await uploadImage(file);
      setFeaturedImage(url);
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed.'); }
    finally { setImgUploading(false); }
  };

  const slugVal = slug;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', background: 'var(--color-background)',
    color: 'var(--color-text)', fontSize: '0.875rem', fontFamily: 'var(--font-ui)', outline: 'none',
  };

  const sectionStyle: React.CSSProperties = {
    background: 'var(--color-background)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1rem',
  };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button type="button" onClick={() => router.push('/admin/posts')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
          <ArrowLeft size={16} /> Posts
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {autoSaveMsg && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{autoSaveMsg}</span>}
          {postId && <a href={`/blog/${slugVal}`} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}><Eye size={15} /> Preview</a>}
          <button type="button" onClick={() => handleSave('draft')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}><Save size={15} /> Save Draft</button>
          <button type="button" onClick={() => handleSave('published')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 }}>
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</> : 'Publish'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Editor */}
        <div>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Article Title..."
              rows={2}
              style={{ width: '100%', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.3, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-text)', resize: 'none', fontFamily: 'var(--font-ui)', padding: 0 }}
            />
          </div>

          {/* Slug */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.5rem 0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <span>/blog/</span>
            <input
              value={slug}
              onChange={e => { setSlugVal(e.target.value); setSlugEdited(true); }}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '0.8125rem', fontFamily: 'var(--font-ui)' }}
            />
          </div>

          {/* Rich text editor */}
          <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            {/* Toolbar */}
            {editor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flexWrap: 'wrap', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={15} /></ToolbarButton>
                <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 0.25rem' }} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 size={15} /></ToolbarButton>
                <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 0.25rem' }} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><Code size={15} /></ToolbarButton>
                <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 0.25rem' }} />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={15} /></ToolbarButton>
                <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 0.25rem' }} />
                <ToolbarButton onClick={() => { const url = window.prompt('Enter URL'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} active={editor.isActive('link')} title="Insert Link"><Link2 size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => { const url = window.prompt('Enter image URL'); if (url) editor.chain().focus().setImage({ src: url }).run(); }} active={false} title="Insert Image"><ImgIcon size={15} /></ToolbarButton>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>

          {/* Excerpt */}
          <div style={{ marginTop: '1.5rem', ...sectionStyle }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="A short summary shown in article cards and search results (150–250 chars)..."
              rows={3}
              maxLength={300}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{excerpt.length}/300 characters</p>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ position: 'sticky', top: '80px' }}>
          {/* Publish */}
          <div style={{ ...sectionStyle }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem' }}>Publish</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as Post['status'])} style={{ ...inputStyle }}>
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <button type="button" onClick={() => handleSave('published')} disabled={saving} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : 'Publish Now'}
              </button>
            </div>
          </div>

          {/* Author */}
          <div style={{ ...sectionStyle }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Author</label>
            <select value={authorId} onChange={e => setAuthorId(e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select author...</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Category */}
          <div style={{ ...sectionStyle }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div style={{ ...sectionStyle }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {tags.map(tag => {
                const sel = selectedTags.includes(tag.name);
                return (
                  <button key={tag.id} type="button" onClick={() => setSelectedTags(sel ? selectedTags.filter(t => t !== tag.name) : [...selectedTags, tag.name])}
                    style={{ padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${sel ? 'var(--color-accent)' : 'var(--color-border)'}`, background: sel ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent', color: sel ? 'var(--color-accent)' : 'var(--color-text-muted)', transition: 'all 100ms' }}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {tags.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No tags yet. Create them in Tags management.</p>}
            </div>
          </div>

          {/* Featured Image */}
          <div style={{ ...sectionStyle }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Featured Image</label>
            {featuredImage ? (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <img src={featuredImage} alt="featured" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={() => setFeaturedImage('')} style={{ position: 'absolute', top: '0.375rem', right: '0.375rem', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
              </div>
            ) : null}
            <input ref={imgInputRef} type="file" accept="image/*" onChange={handleFeaturedImageUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => imgInputRef.current?.click()} disabled={imgUploading} style={{ width: '100%', padding: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-text-muted)', transition: 'all 150ms' }}>
              {imgUploading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : <><Upload size={14} /> {featuredImage ? 'Replace Image' : 'Upload Image'}</>}
            </button>
            {featuredImage && (
              <input type="text" value={featuredImageAlt} onChange={e => setFeaturedImageAlt(e.target.value)} placeholder="Alt text..." style={{ ...inputStyle, marginTop: '0.5rem' }} />
            )}
          </div>

          {/* SEO */}
          <div style={{ ...sectionStyle }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>SEO</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>SEO Title <span style={{ fontWeight: 400 }}>({seoTitle.length}/60)</span></label>
                <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title || 'SEO title...'} maxLength={60} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Meta Description <span style={{ fontWeight: 400 }}>({seoDesc.length}/160)</span></label>
                <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder={excerpt || 'Meta description...'} maxLength={160} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .prose-editor h1 { font-size: 1.75rem; font-weight: 800; margin: 1.5rem 0 0.75rem; }
        .prose-editor h2 { font-size: 1.375rem; font-weight: 700; margin: 1.5rem 0 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.375rem; }
        .prose-editor h3 { font-size: 1.125rem; font-weight: 700; margin: 1.25rem 0 0.625rem; }
        .prose-editor p { margin: 0 0 1rem; }
        .prose-editor ul, .prose-editor ol { padding-left: 1.5rem; margin: 0 0 1rem; }
        .prose-editor li { margin-bottom: 0.375rem; }
        .prose-editor blockquote { border-left: 3px solid var(--color-accent); padding: 0.5rem 1rem; background: var(--color-surface); margin: 1rem 0; border-radius: 0 var(--radius-md) var(--radius-md) 0; font-style: italic; color: var(--color-text-muted); }
        .prose-editor code { background: var(--color-surface-2); padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; }
        .prose-editor pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; margin: 1rem 0; }
        .prose-editor a { color: var(--color-accent); text-decoration: underline; }
        .prose-editor img { max-width: 100%; border-radius: var(--radius-md); margin: 1rem 0; }
        @media (max-width: 1023px) {
          [style*="grid-template-columns: 1fr 300px"] { grid-template-columns: 1fr !important; }
          [style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  );
}
