import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { User as UserIcon, Calendar, BookOpen, LayoutDashboard, Settings as SettingsIcon, UserCircle, Bookmark } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import { ProfileSkeleton } from "../components/Skeleton";
import { safeFormatDate, calculateReadingTime, getBookmarks } from "../lib/utils";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOwnProfile = user?.uid === id;
  const activeTab = isOwnProfile ? (searchParams.get("tab") || "profile") : "profile";

  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndBlogs = async () => {
      try {
        if (!id) return;
        
        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          setUserProfile({ id: userDoc.id, ...userDoc.data() });
        } else {
          // If user doc not found but ID matches current user
          if (user && user.uid === id) {
            setUserProfile({
              id: user.uid,
              name: user.displayName || "User",
              email: user.email || "",
              profileImage: user.photoURL || "",
              bio: "",
              createdAt: Date.now(),
            });
          }
        }

        // Fetch user's published blogs
        const q = query(
          collection(db, "blogs"),
          where("authorId", "==", id)
        );
        const snapshot = await getDocs(q);
        const blogsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((blog: any) => blog.status === "published")
          .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setUserBlogs(blogsData);

        // Fetch bookmarked blogs if own profile
        if (user?.uid === id) {
          const bookmarkIds = getBookmarks();
          if (bookmarkIds.length > 0) {
            const allBlogsQ = query(collection(db, "blogs"));
            const allSnap = await getDocs(allBlogsQ);
            const savedData = allSnap.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((b: any) => bookmarkIds.includes(b.id));
            setBookmarkedBlogs(savedData);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndBlogs();
  }, [id, user]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!userProfile) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-xl font-bold mb-4">User not found</p>
        <Link to="/" className="text-indigo-600 font-semibold hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
        <div className="mx-auto h-28 w-28 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden mb-6 border-4 border-white dark:border-gray-950 shadow-lg flex items-center justify-center font-bold text-2xl text-indigo-600 dark:text-indigo-300">
          {userProfile.profileImage ? (
            <img src={userProfile.profileImage} alt={userProfile.name} className="h-full w-full object-cover" />
          ) : (
            userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12" />
          )}
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{userProfile.name || "Anonymous User"}</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6 text-sm">
          {userProfile.bio || "Writer & storyteller on Fav Animals."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            Joined {safeFormatDate(userProfile.createdAt, "MMMM yyyy")}
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            {userBlogs.length} Published Stories
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      {isOwnProfile && (
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
            <button
              onClick={() => setSearchParams({ tab: "profile" })}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "profile"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <UserCircle className="h-5 w-5" />
              Public Stories
            </button>
            <button
              onClick={() => setSearchParams({ tab: "dashboard" })}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              My Stories Dashboard
            </button>
            <button
              onClick={() => setSearchParams({ tab: "bookmarks" })}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "bookmarks"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Bookmark className="h-5 w-5" />
              Bookmarked ({bookmarkedBlogs.length})
            </button>
            <button
              onClick={() => setSearchParams({ tab: "settings" })}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "settings"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <SettingsIcon className="h-5 w-5" />
              Account Settings
            </button>
          </nav>
        </div>
      )}

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "profile" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-4">
              Stories by {userProfile.name}
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2">
              {userBlogs.length === 0 ? (
                <p className="text-gray-500 col-span-2 text-center py-12">No published stories yet.</p>
              ) : (
                userBlogs.map((blog) => (
                  <article key={blog.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {blog.category || "General"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {safeFormatDate(blog.createdAt)} • {calculateReadingTime(blog.content || "")} min read
                        </span>
                      </div>
                      <Link to={`/blog/${blog.slug || blog.id}`} className="group block mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                        {blog.content ? blog.content.substring(0, 150).replace(/[#*`_]/g, "") : ""}...
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {isOwnProfile && activeTab === "bookmarks" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-4">
              Saved & Bookmarked Stories
            </h2>

            {bookmarkedBlogs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't bookmarked any stories yet.</p>
                <Link to="/" className="inline-flex rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                  Explore Stories
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {bookmarkedBlogs.map((blog) => (
                  <article key={blog.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {blog.category || "General"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {safeFormatDate(blog.createdAt)} • {calculateReadingTime(blog.content || "")} min read
                        </span>
                      </div>
                      <Link to={`/blog/${blog.slug || blog.id}`} className="group block mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                        {blog.content ? blog.content.substring(0, 150).replace(/[#*`_]/g, "") : ""}...
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {isOwnProfile && activeTab === "dashboard" && (
          <Dashboard />
        )}

        {isOwnProfile && activeTab === "settings" && (
          <Settings />
        )}
      </div>
    </div>
  );
}

