import { useState, useEffect } from "react";
import { Link } from "react-router";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Clock, TrendingUp, MessageSquare, Heart, User as UserIcon, Bookmark, Sparkles, PenTool } from "lucide-react";
import { BlogCardSkeleton, TrendingBlogSkeleton } from "../components/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import { safeFormatDate, calculateReadingTime, DEFAULT_CATEGORIES, isBookmarked, toggleBookmark } from "../lib/utils";
import toast from "react-hot-toast";

export default function Home() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories from Firestore
        const categoriesQuery = query(collection(db, "categories"), orderBy("createdAt", "desc"));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        if (!categoriesSnapshot.empty) {
          const dbCatNames = categoriesSnapshot.docs.map(doc => doc.data().name).filter(Boolean);
          const combined = Array.from(new Set([...dbCatNames, ...DEFAULT_CATEGORIES]));
          setCategories(combined);
        }

        // Fetch trending blogs
        const trendingQ = query(
          collection(db, "blogs"),
          orderBy("views", "desc")
        );
        const trendingSnapshot = await getDocs(trendingQ);
        const trendingData = trendingSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((blog: any) => blog.status === "published")
          .slice(0, 3);
        setTrendingBlogs(trendingData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "blogs"),
          orderBy("createdAt", "desc"),
          limit(100)
        );

        const snapshot = await getDocs(q);
        let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        // Filter by status client-side to avoid composite index requirement
        data = data.filter((blog: any) => blog.status === "published");

        if (selectedCategory) {
          data = data.filter((blog: any) => blog.category === selectedCategory);
        }

        setBlogs(data.slice(0, 12));
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [selectedCategory]);

  const handleToggleBookmark = (e: React.MouseEvent, blogId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleBookmark(blogId);
    if (added) {
      setBookmarkedIds(prev => [...prev, blogId]);
      toast.success("Saved to bookmarks");
    } else {
      setBookmarkedIds(prev => prev.filter(id => id !== blogId));
      toast("Removed from bookmarks");
    }
  };

  if (loading) {
    return (
      <div className="space-y-12">
        <section className="text-center py-12 sm:py-20">
          <div className="h-16 w-3/4 mx-auto bg-gray-200 dark:bg-gray-800 rounded-2xl mb-6 animate-pulse" />
          <div className="h-6 w-1/2 mx-auto bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse" />
          <div className="h-12 w-40 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </section>

        <section className="mb-16">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <TrendingBlogSkeleton key={i} />
            ))}
          </div>
        </section>

        <section>
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center py-16 sm:py-24 rounded-3xl bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-gray-950 dark:to-transparent border border-gray-100/80 dark:border-gray-800/80 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-900/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The Modern Developer & Creator Publishing Hub</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 max-w-4xl mx-auto leading-tight">
          Write, inspire & connect with the world
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Share your ideas, tech tutorials, and animal stories with Markdown, real-time engagement, and AI assistance.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to={user ? "/create" : "/register"}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <PenTool className="h-4 w-4" />
            <span>Start Writing Now</span>
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-6 py-3.5 text-base font-semibold text-gray-800 dark:text-gray-200 transition-colors"
          >
            Explore Stories
          </Link>
        </div>
      </section>

      {/* Trending Posts */}
      {trendingBlogs.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-2.5 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Trending Stories</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {trendingBlogs.map((blog, index) => (
              <Link key={blog.id} to={`/blog/${blog.slug || blog.id}`} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group">
                <span className="text-4xl font-extrabold text-indigo-200 dark:text-gray-800 group-hover:text-indigo-600 transition-colors">
                  0{index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 mb-2 transition-colors">
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate font-medium">{blog.authorName || "Anonymous"}</span>
                    <span>•</span>
                    <span>{safeFormatDate(blog.createdAt, "MMM d")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Latest Stories</h2>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Topics
            </button>
            {categories.map((catName) => (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === catName
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {catName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => {
            const isSaved = bookmarkedIds.includes(blog.id) || isBookmarked(blog.id);
            return (
              <article key={blog.id} className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                      {blog.category || "General"}
                    </span>
                    <button
                      onClick={(e) => handleToggleBookmark(e, blog.id)}
                      className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        isSaved ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 hover:text-gray-600"
                      }`}
                      title={isSaved ? "Remove Bookmark" : "Save Story"}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <Link to={`/blog/${blog.slug || blog.id}`} className="block mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">
                      {blog.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {blog.content ? blog.content.substring(0, 150).replace(/[#*`_]/g, "") : ""}...
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800">
                        {blog.authorImage ? (
                          <img src={blog.authorImage} alt={blog.authorName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          blog.authorName ? blog.authorName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {blog.authorName || "Anonymous"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {safeFormatDate(blog.createdAt)} • {calculateReadingTime(blog.content || "")} min read
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                      <span className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart className="h-3.5 w-3.5" /> {blog.likes || 0}</span>
                      <span className="flex items-center gap-1 hover:text-indigo-500 transition-colors"><MessageSquare className="h-3.5 w-3.5" /> {blog.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {blogs.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No stories published in this topic yet.</p>
            <Link to="/create" className="inline-flex rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Be the first to publish
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

