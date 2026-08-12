import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Edit, Trash2, Eye, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../components/Modal";
import { DashboardSkeleton } from "../components/Skeleton";
import { safeFormatDate } from "../lib/utils";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchUserBlogs();
    }
  }, [user, authLoading, navigate]);

  const fetchUserBlogs = async () => {
    try {
      const q = query(
        collection(db, "blogs"),
        where("authorId", "==", user!.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load your blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    
    try {
      await deleteDoc(doc(db, "blogs", blogToDelete));
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete));
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    } finally {
      setBlogToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setBlogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  const publishedCount = blogs.filter(b => b.status === "published").length;
  const draftCount = blogs.filter(b => b.status === "draft").length;
  const totalViews = blogs.reduce((acc, blog) => acc + (blog.views || 0), 0);
  const totalLikes = blogs.reduce((acc, blog) => acc + (blog.likes || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <Link
          to="/create"
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
        >
          Write a story
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{publishedCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Drafts</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{draftCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Likes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalLikes}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Stories</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {blogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              You haven't written any stories yet.
            </div>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <Link to={`/blog/${blog.slug || blog.id}`} className="block focus:outline-none">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate hover:text-indigo-600 transition-colors">{blog.title || "Untitled Story"}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        blog.status === "published" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {blog.status}
                      </span>
                      <span className="text-xs">{safeFormatDate(blog.createdAt)}</span>
                      {blog.status === "published" && (
                        <>
                          <span className="flex items-center gap-1 text-xs"><Eye className="h-3.5 w-3.5" /> {blog.views || 0}</span>
                          <span className="flex items-center gap-1 text-xs"><BarChart2 className="h-3.5 w-3.5" /> {blog.likes || 0}</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/edit/${blog.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(blog.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
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
    </div>
  );
}
