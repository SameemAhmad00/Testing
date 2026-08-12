import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment, addDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Heart, MessageSquare, Share2, Bookmark, User as UserIcon, Trash2, Edit, ArrowLeft, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { ConfirmationModal } from "../components/Modal";
import { BlogDetailSkeleton } from "../components/Skeleton";
import { safeFormatDate, calculateReadingTime, isBookmarked, toggleBookmark } from "../lib/utils";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [blog, setBlog] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        
        let docData: any = null;
        let blogId: string = "";

        // First try query by slug
        const q = query(collection(db, "blogs"), where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const first = snapshot.docs[0];
          blogId = first.id;
          docData = { id: first.id, ...first.data() };
        } else {
          // Fallback: try fetching by document ID
          const directDocRef = doc(db, "blogs", slug);
          const directSnap = await getDoc(directDocRef);
          if (directSnap.exists()) {
            blogId = directSnap.id;
            docData = { id: directSnap.id, ...directSnap.data() };
          }
        }

        if (docData) {
          setBlog(docData);
          setSaved(isBookmarked(docData.id));

          // Increment views
          await updateDoc(doc(db, "blogs", docData.id), {
            views: increment(1)
          }).catch(() => {});

          // Fetch comments in realtime
          const commentsQuery = query(
            collection(db, "comments"),
            where("blogId", "==", docData.id)
          );
          
          const unsubscribe = onSnapshot(commentsQuery, (querySnapshot) => {
            const commentsData = querySnapshot.docs
              .map(d => ({
                id: d.id,
                ...d.data()
              }))
              .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
            setComments(commentsData);
          });

          return () => unsubscribe();
        } else {
          toast.error("Story not found");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like this story");
      return;
    }
    if (hasLiked) return;

    try {
      await updateDoc(doc(db, "blogs", blog.id), {
        likes: increment(1)
      });
      setBlog({ ...blog, likes: (blog.likes || 0) + 1 });
      setHasLiked(true);
      toast.success("Liked story!");
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  const handleToggleSave = () => {
    if (!blog?.id) return;
    const isAdded = toggleBookmark(blog.id);
    setSaved(isAdded);
    if (isAdded) {
      toast.success("Story saved to bookmarks");
    } else {
      toast("Removed from bookmarks");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a comment");
      return;
    }
    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        blogId: blog.id,
        userId: user.uid,
        userName: profile?.name || user.displayName || "Anonymous",
        userImage: profile?.profileImage || user.photoURL || "",
        comment: newComment.trim(),
        createdAt: Date.now(),
        likes: 0
      });
      
      await updateDoc(doc(db, "blogs", blog.id), {
        commentsCount: increment(1)
      });
      
      setNewComment("");
      toast.success("Response posted!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to post response");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Story link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "blogs", blog.id));
      toast.success("Story deleted successfully");
      navigate(`/profile/${user?.uid}?tab=dashboard`);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete story");
    }
  };

  if (loading) {
    return <BlogDetailSkeleton />;
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Story Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400">The story you are looking for may have been deleted or moved.</p>
        <Link to="/" className="inline-flex rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Back to Feed
        </Link>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blog.content || "");
  const excerpt = blog.content ? blog.content.substring(0, 160).replace(/[#*`_]/g, "") + "..." : "Read this story on Fav Animals.";

  return (
    <article className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-[60]">
        <div
          className="h-full bg-indigo-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Helmet>
        <title>{blog.title} | Fav Animals</title>
        <meta name="description" content={excerpt} />
      </Helmet>

      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
            {blog.category || "General"}
          </span>
          <span className="text-xs text-gray-400">
            {safeFormatDate(blog.createdAt)} • {readingTime} min read
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <Link to={`/profile/${blog.authorId}`} className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden ring-2 ring-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
              {blog.authorImage ? (
                <img src={blog.authorImage} alt={blog.authorName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                blog.authorName ? blog.authorName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {blog.authorName || "Anonymous"}
              </p>
              <p className="text-xs text-gray-400">Author</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToggleSave} 
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${saved ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}
              title={saved ? "Remove Bookmark" : "Save Story"}
            >
              <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
            </button>

            <button onClick={handleShare} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Share Story">
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
            </button>

            {(user?.uid === blog.authorId || profile?.role === "admin") && (
              <>
                <Link to={`/edit/${blog.id}`} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Edit Story">
                  <Edit className="h-5 w-5" />
                </Link>
                <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Delete Story">
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Article Markdown Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-3xl prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-pre:rounded-2xl mb-12 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {blog.content}
        </ReactMarkdown>
      </div>

      {/* Engagement Actions */}
      <div className="flex items-center gap-6 py-6 border-y border-gray-200 dark:border-gray-800 mb-12">
        <button onClick={handleLike} className={`flex items-center gap-2 text-sm font-bold ${hasLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400'} transition-colors`}>
          <Heart className={`h-6 w-6 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{blog.likes || 0} Likes</span>
        </button>

        <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
          <MessageSquare className="h-6 w-6 text-indigo-500" />
          <span>{comments.length} Responses</span>
        </div>
      </div>

      {/* Comment Section */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Responses ({comments.length})</h3>
        
        {user ? (
          <form onSubmit={handleComment} className="flex gap-4">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile?.name ? profile.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts on this story?"
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:text-white min-h-[110px] resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Post Response
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">Join the discussion to share your response.</p>
            <Link to="/login" className="inline-flex rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Log in to comment
            </Link>
          </div>
        )}

        <div className="space-y-6 pt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <Link to={`/profile/${comment.userId}`} className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                {comment.userImage ? (
                  <img src={comment.userImage} alt={comment.userName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  comment.userName ? comment.userName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />
                )}
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/profile/${comment.userId}`} className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 transition-colors text-sm">
                    {comment.userName}
                  </Link>
                  <span className="text-xs text-gray-400">
                    {safeFormatDate(comment.createdAt, "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Story"
        confirmText="Delete"
        confirmVariant="danger"
      >
        Are you sure you want to delete this story? This action cannot be undone.
      </ConfirmationModal>
    </article>
  );
}

