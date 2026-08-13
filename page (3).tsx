import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'About Us', description: 'Learn more about ProBlog and our mission.' };

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '1.5rem' }}>About ProBlog</h1>
      <div className="prose">
        <p>Welcome to <strong>ProBlog</strong> — a professional publishing platform dedicated to delivering high-quality articles on technology, design, business, and more.</p>
        <h2>Our Mission</h2>
        <p>We believe in the power of well-crafted writing to inform, inspire, and spark conversation. Our goal is to create a space where thoughtful ideas meet a beautiful reading experience.</p>
        <h2>What We Cover</h2>
        <ul>
          <li>Technology &amp; Innovation</li>
          <li>Design &amp; Creativity</li>
          <li>Business &amp; Startups</li>
          <li>Productivity &amp; Tools</li>
          <li>Culture &amp; Society</li>
        </ul>
        <h2>Our Team</h2>
        <p>ProBlog is built and maintained by a passionate team of writers, designers, and developers who care deeply about the craft of publishing.</p>
        <h2>Get in Touch</h2>
        <p>Have a story to tell or want to contribute? We&apos;d love to hear from you. Head over to our <a href="/contact">Contact</a> page.</p>
      </div>
    </div>
  );
}
