import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Terms of Service', description: 'ProBlog Terms of Service' };
export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '1.5rem' }}>Terms of Service</h1>
      <div className="prose">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h2>Acceptance of Terms</h2>
        <p>By accessing and using ProBlog, you accept and agree to be bound by these Terms of Service.</p>
        <h2>Use of Service</h2>
        <p>You may use our service for lawful purposes only. You agree not to post harmful, defamatory, or illegal content.</p>
        <h2>Intellectual Property</h2>
        <p>Content published on ProBlog is owned by the respective authors. Reproduction without permission is prohibited.</p>
        <h2>Newsletter</h2>
        <p>By subscribing to our newsletter, you agree to receive periodic email updates. You may unsubscribe at any time.</p>
        <h2>Limitation of Liability</h2>
        <p>ProBlog is provided &ldquo;as is&rdquo; without warranties. We are not liable for any damages arising from your use of the service.</p>
        <h2>Changes to Terms</h2>
        <p>We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>
      </div>
    </div>
  );
}
