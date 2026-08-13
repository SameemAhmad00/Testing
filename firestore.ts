import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp,
  DocumentSnapshot, QueryConstraint, increment, setDoc, writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PostStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'trash';

export interface Post {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  authorId: string;
  authorName?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  tags?: string[];
  status: PostStatus;
  publishedAt?: Timestamp | null;
  scheduledAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  viewCount?: number;
  readingTime?: number;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  postCount?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Tag {
  id?: string;
  name: string;
  slug: string;
  postCount?: number;
  createdAt?: Timestamp;
}

export interface Author {
  id?: string;
  name: string;
  slug: string;
  email?: string;
  avatar?: string;
  bio?: string;
  jobTitle?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  role?: string;
  status?: 'active' | 'inactive';
  postCount?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Comment {
  id?: string;
  postId: string;
  postTitle?: string;
  name: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Subscriber {
  id?: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  source?: string;
  subscribedAt?: Timestamp;
}

export interface MediaItem {
  id?: string;
  url: string;
  filename: string;
  altText?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  size?: number;
  type?: string;
  uploadedAt?: Timestamp;
}

export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  logo?: string;
  darkLogo?: string;
  favicon?: string;
  primaryColor?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  commentsEnabled?: boolean;
  requireApproval?: boolean;
  allowGuestComments?: boolean;
  senderName?: string;
  senderEmail?: string;
  timezone?: string;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(constraints: QueryConstraint[] = []): Promise<Post[]> {
  const q = query(collection(db, 'posts'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
}

export async function getPublishedPosts(limitCount = 10, lastDoc?: DocumentSnapshot): Promise<Post[]> {
  const constraints: QueryConstraint[] = [
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));
  return getPosts(constraints);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Post;
}

export async function getPostById(id: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, 'posts', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Post;
}

export async function createPost(data: Omit<Post, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'posts'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    viewCount: 0,
  });
  return ref.id;
}

export async function updatePost(id: string, data: Partial<Post>): Promise<void> {
  await updateDoc(doc(db, 'posts', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', id));
}

export async function incrementPostViews(id: string): Promise<void> {
  await updateDoc(doc(db, 'posts', id), { viewCount: increment(1) });
}

export async function getPostsByCategory(categorySlug: string, limitCount = 10): Promise<Post[]> {
  return getPosts([
    where('status', '==', 'published'),
    where('categorySlug', '==', categorySlug),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  ]);
}

export async function getPostsByTag(tag: string, limitCount = 10): Promise<Post[]> {
  return getPosts([
    where('status', '==', 'published'),
    where('tags', 'array-contains', tag),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  ]);
}

export async function getPostsByAuthor(authorId: string, limitCount = 10): Promise<Post[]> {
  return getPosts([
    where('status', '==', 'published'),
    where('authorId', '==', authorId),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  ]);
}

export async function getFeaturedPosts(limitCount = 3): Promise<Post[]> {
  return getPosts([
    where('status', '==', 'published'),
    orderBy('viewCount', 'desc'),
    limit(limitCount)
  ]);
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  // Simple title-based search (Firestore doesn't support full-text)
  const all = await getPosts([where('status', '==', 'published'), orderBy('publishedAt', 'desc')]);
  const term = searchTerm.toLowerCase();
  return all.filter(p =>
    p.title.toLowerCase().includes(term) ||
    p.excerpt?.toLowerCase().includes(term) ||
    p.authorName?.toLowerCase().includes(term) ||
    p.categoryName?.toLowerCase().includes(term) ||
    p.tags?.some(t => t.toLowerCase().includes(term))
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const q = query(collection(db, 'categories'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Category;
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await updateDoc(doc(db, 'categories', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  const snap = await getDocs(query(collection(db, 'tags'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Tag));
}

export async function createTag(data: Omit<Tag, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'tags'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteTag(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tags', id));
}

// ─── Authors ──────────────────────────────────────────────────────────────────

export async function getAuthors(): Promise<Author[]> {
  const snap = await getDocs(query(collection(db, 'authors'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Author));
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const q = query(collection(db, 'authors'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Author;
}

export async function getAuthorById(id: string): Promise<Author | null> {
  const snap = await getDoc(doc(db, 'authors', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Author;
}

export async function createAuthor(data: Omit<Author, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'authors'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateAuthor(id: string, data: Partial<Author>): Promise<void> {
  await updateDoc(doc(db, 'authors', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteAuthor(id: string): Promise<void> {
  await deleteDoc(doc(db, 'authors', id));
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(statusFilter?: string): Promise<Comment[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (statusFilter) constraints.unshift(where('status', '==', statusFilter));
  const q = query(collection(db, 'comments'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const q = query(collection(db, 'comments'), where('postId', '==', postId), where('status', '==', 'approved'), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
}

export async function createComment(data: Omit<Comment, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'comments'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateComment(id: string, data: Partial<Comment>): Promise<void> {
  await updateDoc(doc(db, 'comments', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteComment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'comments', id));
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

export async function getSubscribers(): Promise<Subscriber[]> {
  const snap = await getDocs(query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber));
}

export async function addSubscriber(email: string, name?: string, source?: string): Promise<string> {
  // check if already subscribed
  const q = query(collection(db, 'subscribers'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    // reactivate if unsubscribed
    await updateDoc(snap.docs[0].ref, { status: 'active' });
    return snap.docs[0].id;
  }
  const ref = await addDoc(collection(db, 'subscribers'), {
    email, name: name || '', source: source || 'website', status: 'active', subscribedAt: serverTimestamp()
  });
  return ref.id;
}

export async function deleteSubscriber(id: string): Promise<void> {
  await deleteDoc(doc(db, 'subscribers', id));
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function getMedia(): Promise<MediaItem[]> {
  const snap = await getDocs(query(collection(db, 'media'), orderBy('uploadedAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));
}

export async function addMedia(data: Omit<MediaItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'media'), { ...data, uploadedAt: serverTimestamp() });
  return ref.id;
}

export async function updateMedia(id: string, data: Partial<MediaItem>): Promise<void> {
  await updateDoc(doc(db, 'media', id), data);
}

export async function deleteMedia(id: string): Promise<void> {
  await deleteDoc(doc(db, 'media', id));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  if (!snap.exists()) return { siteName: 'ProBlog', siteDescription: 'A professional publishing platform' };
  return snap.data() as SiteSettings;
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  await setDoc(doc(db, 'settings', 'site'), data, { merge: true });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function recordAnalyticsEvent(event: string, data: Record<string, unknown> = {}): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'analytics', today);
  await setDoc(ref, {
    date: today,
    [event]: increment(1),
    lastUpdated: serverTimestamp(),
    ...Object.entries(data).reduce((acc, [k, v]) => ({ ...acc, [`${event}_${k}`]: v }), {})
  }, { merge: true });
}

export async function getAnalytics(days = 30): Promise<Record<string, unknown>[]> {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  const results = await Promise.all(dates.map(async d => {
    const snap = await getDoc(doc(db, 'analytics', d));
    return { date: d, ...(snap.exists() ? snap.data() : { page_view: 0, article_view: 0 }) };
  }));
  return results;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function addAuditLog(action: string, details: Record<string, unknown>): Promise<void> {
  await addDoc(collection(db, 'auditLogs'), {
    action,
    ...details,
    timestamp: serverTimestamp(),
  });
}

export async function getAuditLogs(limitCount = 50): Promise<Record<string, unknown>[]> {
  const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 225;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
