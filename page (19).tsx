'use client';

import { useEffect, useState, useRef } from 'react';
import { getMedia, addMedia, deleteMedia, MediaItem } from '@/lib/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Upload, Grid, List, Trash2, Copy, Search, Loader2, Image as ImgIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const m = await getMedia(); setMedia(m); setLoading(false); }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const storageRef = ref(storage, `media/${Date.now()}-${file.name}`);
        const task = uploadBytesResumable(storageRef, file);
        await new Promise<void>((res, rej) => {
          task.on('state_changed',
            snap => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
            rej,
            async () => {
              const url = await getDownloadURL(task.snapshot.ref);
              await addMedia({ url, filename: file.name, type: file.type, size: file.size });
              res();
            }
          );
        });
      }
      toast.success(`${files.length} file(s) uploaded!`);
      load();
    } catch { toast.error('Upload failed.'); }
    finally { setUploading(false); setUploadProgress(0); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.filename}"?`)) return;
    try {
      await deleteMedia(item.id!);
      try { await deleteObject(ref(storage, item.url)); } catch {}
      setMedia(m => m.filter(x => x.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      toast.success('File deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); toast.success('URL copied!'); };

  const filtered = media.filter(m => !search || m.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Media Library</h1>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={() => setView('grid')} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: view === 'grid' ? 'var(--color-accent)' : 'var(--color-surface)', color: view === 'grid' ? '#fff' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}><Grid size={16} /></button>
          <button onClick={() => setView('list')} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: view === 'list' ? 'var(--color-accent)' : 'var(--color-surface)', color: view === 'list' ? '#fff' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}><List size={16} /></button>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            {uploading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{Math.round(uploadProgress)}%</> : <><Upload size={15} />Upload</>}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.25rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', outline: 'none' }} />
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer', transition: 'all 150ms ease-out', background: 'var(--color-surface)' }}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; }}
        onDragLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
        onDrop={async e => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
          const files = Array.from(e.dataTransfer.files);
          if (fileRef.current) { const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); fileRef.current.files = dt.files; fileRef.current.dispatchEvent(new Event('change', { bubbles: true })); }
        }}
      >
        <Upload size={28} style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }} />
        <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>Drop files or click to upload</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Images, videos — any size</p>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <ImgIcon size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>No media found. Upload your first file!</p>
            </div>
          ) : view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.875rem' }}>
              {filtered.map(item => (
                <div key={item.id} onClick={() => setSelected(item)} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: `2px solid ${selected?.id === item.id ? 'var(--color-accent)' : 'var(--color-border)'}`, cursor: 'pointer', background: 'var(--color-surface)', transition: 'border-color 150ms' }}>
                  <div style={{ height: '110px', overflow: 'hidden', background: 'var(--color-surface-2)' }}>
                    {item.type?.startsWith('image') ? (
                      <img src={item.url} alt={item.altText || item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><ImgIcon size={28} style={{ opacity: 0.3 }} /></div>}
                  </div>
                  <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }} className="line-clamp-1">{item.filename}</div>
                </div>
              ))}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                {['Preview', 'Filename', 'Type', 'Size', 'Uploaded', 'Actions'].map(h => <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.625rem 0.875rem' }}><div style={{ width: '48px', height: '36px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-surface-2)' }}>{item.type?.startsWith('image') && <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div></td>
                    <td style={{ padding: '0.625rem 0.875rem', maxWidth: '200px' }} className="line-clamp-1">{item.filename}</td>
                    <td style={{ padding: '0.625rem 0.875rem', color: 'var(--color-text-muted)' }}>{item.type?.split('/')[1] || '—'}</td>
                    <td style={{ padding: '0.625rem 0.875rem', color: 'var(--color-text-muted)' }}>{item.size ? `${(item.size / 1024).toFixed(1)} KB` : '—'}</td>
                    <td style={{ padding: '0.625rem 0.875rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{item.uploadedAt ? formatDistanceToNow((item.uploadedAt as { toDate: () => Date }).toDate(), { addSuffix: true }) : '—'}</td>
                    <td style={{ padding: '0.625rem 0.875rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => copyUrl(item.url)} style={{ padding: '0.375rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><Copy size={14} /></button>
                        <button onClick={() => handleDelete(item)} style={{ padding: '0.375rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                        ><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width: '240px', flexShrink: 0, background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1rem', alignSelf: 'flex-start', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>File Details</span>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={16} /></button>
            </div>
            {selected.type?.startsWith('image') && <img src={selected.url} alt={selected.filename} style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '0.875rem', maxHeight: '150px', objectFit: 'cover' }} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <div><strong style={{ color: 'var(--color-text)' }}>Name:</strong> {selected.filename}</div>
              {selected.size && <div><strong style={{ color: 'var(--color-text)' }}>Size:</strong> {(selected.size / 1024).toFixed(1)} KB</div>}
              {selected.type && <div><strong style={{ color: 'var(--color-text)' }}>Type:</strong> {selected.type}</div>}
            </div>
            <button onClick={() => copyUrl(selected.url)} style={{ width: '100%', marginTop: '1rem', padding: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <Copy size={14} /> Copy URL
            </button>
            <button onClick={() => handleDelete(selected)} style={{ width: '100%', marginTop: '0.5rem', padding: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', color: 'var(--color-error)', border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
