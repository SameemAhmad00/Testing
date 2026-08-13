'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/lib/firestore';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['General', 'Branding', 'SEO', 'Social', 'Comments', 'Email'] as const;
type Tab = typeof TABS[number];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('General');
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await updateSiteSettings(settings); toast.success('Settings saved!'); }
    catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const set = (key: keyof SiteSettings, val: unknown) => setSettings(s => ({ ...s, [key]: val }));

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9375rem', fontFamily: 'var(--font-ui)', outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' };
  const group: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1.25rem' };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Settings</h1>
        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
          {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Saving...</> : <><Save size={14} />Save Settings</>}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: tab === t ? 'var(--color-accent)' : 'transparent', color: tab === t ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
        {tab === 'General' && (
          <>
            <div style={group}><label style={labelStyle}>Site Name</label><input type="text" value={settings.siteName || ''} onChange={e => set('siteName', e.target.value)} style={inputStyle} placeholder="ProBlog" /></div>
            <div style={group}><label style={labelStyle}>Site Description</label><textarea value={settings.siteDescription || ''} onChange={e => set('siteDescription', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="A professional publishing platform..." /></div>
            <div style={group}><label style={labelStyle}>Timezone</label>
              <select value={settings.timezone || 'UTC'} onChange={e => set('timezone', e.target.value)} style={inputStyle}>
                {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'].map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </div>
          </>
        )}

        {tab === 'Branding' && (
          <>
            <div style={group}><label style={labelStyle}>Logo URL</label><input type="url" value={settings.logo || ''} onChange={e => set('logo', e.target.value)} style={inputStyle} placeholder="https://..." /></div>
            <div style={group}><label style={labelStyle}>Dark Mode Logo URL</label><input type="url" value={settings.darkLogo || ''} onChange={e => set('darkLogo', e.target.value)} style={inputStyle} /></div>
            <div style={group}><label style={labelStyle}>Favicon URL</label><input type="url" value={settings.favicon || ''} onChange={e => set('favicon', e.target.value)} style={inputStyle} /></div>
            <div style={group}><label style={labelStyle}>Social Sharing Image URL</label><input type="url" value={settings.socialImage || ''} onChange={e => set('socialImage', e.target.value)} style={inputStyle} /></div>
          </>
        )}

        {tab === 'SEO' && (
          <>
            <div style={group}><label style={labelStyle}>Default SEO Title</label><input type="text" value={settings.seoTitle || ''} onChange={e => set('seoTitle', e.target.value)} style={inputStyle} placeholder="ProBlog — Professional Publishing" /></div>
            <div style={group}><label style={labelStyle}>Default Meta Description</label><textarea value={settings.seoDescription || ''} onChange={e => set('seoDescription', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          </>
        )}

        {tab === 'Social' && (
          <>
            {(['twitter', 'facebook', 'instagram', 'linkedin', 'youtube'] as const).map(platform => (
              <div key={platform} style={group}>
                <label style={labelStyle}>{platform.charAt(0).toUpperCase() + platform.slice(1)} URL</label>
                <input type="url" value={(settings as Record<string, unknown>)[platform] as string || ''} onChange={e => set(platform as keyof SiteSettings, e.target.value)} style={inputStyle} placeholder={`https://${platform}.com/yourpage`} />
              </div>
            ))}
          </>
        )}

        {tab === 'Comments' && (
          <>
            {[
              { key: 'commentsEnabled', label: 'Enable Comments' },
              { key: 'requireApproval', label: 'Require Approval Before Showing' },
              { key: 'allowGuestComments', label: 'Allow Guest Comments (No Account Required)' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</span>
                <button type="button" onClick={() => set(key as keyof SiteSettings, !(settings as Record<string, unknown>)[key])} style={{ width: '44px', height: '24px', borderRadius: 'var(--radius-full)', background: (settings as Record<string, unknown>)[key] ? 'var(--color-accent)' : 'var(--color-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 200ms' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: (settings as Record<string, unknown>)[key] ? '23px' : '3px', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'Email' && (
          <>
            <div style={group}><label style={labelStyle}>Sender Name</label><input type="text" value={settings.senderName || ''} onChange={e => set('senderName', e.target.value)} style={inputStyle} placeholder="ProBlog Newsletter" /></div>
            <div style={group}><label style={labelStyle}>Sender Email</label><input type="email" value={settings.senderEmail || ''} onChange={e => set('senderEmail', e.target.value)} style={inputStyle} placeholder="newsletter@problog.com" /></div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
