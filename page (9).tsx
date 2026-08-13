import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy Policy', description: 'ProBlog Privacy Policy' };
export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '1.5rem' }}>Privacy Policy</h1>
      <div className="prose">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as your email address when you subscribe to our newsletter or leave a comment.</p>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to send you newsletters, respond to comments, and improve our service.</p>
        <h2>Cookies</h2>
        <p>We use cookies to store your theme preference and to remember your session.</p>
        <h2>Third-Party Services</h2>
        <p>We use Firebase (Google) for data storage and authentication. Please review Google&apos;s privacy policy for information about how they handle your data.</p>
        <h2>Contact</h2>
        <p>If you have any questions about this privacy policy, please <a href="/contact">contact us</a>.</p>
      </div>
    </div>
  );
}
