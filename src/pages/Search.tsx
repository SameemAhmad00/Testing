import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { subDays, subMonths, subYears } from "date-fns";
import { Clock, Search as SearchIcon, Filter, Heart, MessageSquare } from "lucide-react";
import { BlogCardSkeleton } from "../components/Skeleton";
import { safeFormatDate, calculateReadingTime, DEFAULT_CATEGORIES } from "../lib/utils";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialTag = searchParams.get("tag") || "";
  const initialDate = searchParams.get("date") || "all";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);
  const [dateRange, setDateRange] = useState(initialDate);
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesQuery = query(collection(db, "categories"), orderBy("createdAt", "desc"));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        if (!categoriesSnapshot.empty) {
          const dbCatNames = categoriesSnapshot.docs.map(doc => doc.data().name).filter(Boolean);
          setCategories(Array.from(new Set([...dbCatNames, ...DEFAULT_CATEGORIES])));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [category, tag, dateRange]);

  useEffect(() => {
    // Client-side filtering for search query
    if (searchQuery.trim() === "") {
      setFilteredBlogs(blogs);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = blogs.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(lowerQuery) ||
          blog.content?.toLowerCase().includes(lowerQuery) ||
          blog.tags?.some((t: string) => t.toLowerCase().includes(lowerQuery))
      );
      setFilteredBlogs(filtered);
    }
  }, [searchQuery, blogs]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      data = data.filter((blog: any) => blog.status === "published");

      if (category) {
        data = data.filter((blog: any) => blog.category === category);
      }

      if (tag) {
        data = data.filter((blog: any) => blog.tags?.some((t: string) => t.toLowerCase().includes(tag.toLowerCase())));
      }

      if (dateRange !== "all") {
        let fromDate = new Date();
        if (dateRange === "week") fromDate = subDays(new Date(), 7);
        else if (dateRange === "month") fromDate = subMonths(new Date(), 1);
        else if (dateRange === "year") fromDate = subYears(new Date(), 1);
        
        data = data.filter((blog: any) => (blog.createdAt || 0) >= fromDate.getTime());
      }
      
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      ...(searchQuery && { q: searchQuery }),
      ...(category && { category }),
      ...(tag && { tag }),
      ...(dateRange !== "all" && { date: dateRange }),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Search Stories
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Discover stories, insights, and tutorials by title, topic, or tag.
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-28 py-4 border border-gray-200 dark:border-gray-800 rounded-full leading-5 bg-white dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm shadow-sm dark:text-white"
            placeholder="Search by keyword, tag, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute inset-y-2 right-2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-3.5 w-3.5 text-indigo-500" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg animate-in fade-in slide-in-from-top-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Tag
              </label>
              <input
                type="text"
                placeholder="e.g. react"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </div>
        )}
      </form>

      <div className="pt-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {loading ? "Searching stories..." : `${filteredBlogs.length} Stories Found`}
          </h2>
          {(category || tag || searchQuery || dateRange !== "all") && (
            <button
              onClick={() => {
                setCategory("");
                setTag("");
                setSearchQuery("");
                setDateRange("all");
                setSearchParams({});
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No stories found matching your criteria.</p>
            <p className="text-xs text-gray-400 mb-6">Try searching for different keywords or clear your active filters.</p>
            <Link to="/create" className="inline-flex rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Publish a story on this topic
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article key={blog.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {blog.category || "General"}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {safeFormatDate(blog.createdAt)} • {calculateReadingTime(blog.content || "")} min read
                    </span>
                  </div>
                  <Link to={`/blog/${blog.slug || blog.id}`} className="group block mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">
                      {blog.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                    {blog.content ? blog.content.substring(0, 150).replace(/[#*`_]/g, "") : ""}...
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {blog.authorName || "Anonymous"}
                    </span>
                    <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                      <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {blog.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {blog.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

