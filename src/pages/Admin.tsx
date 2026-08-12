import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { collection, query, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Trash2, Eye, Users, FileText, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../components/Modal";
import { safeFormatDate } from "../lib/utils";

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"blogs" | "users" | "categories">("blogs");

  // Modal state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: "danger" | "primary";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const openModal = (config: Omit<typeof modalConfig, "isOpen">) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (!authLoading) {
      const isDefaultAdmin = user?.email === "sameem@gmail.com";
      if (!user || (profile?.role !== "admin" && !isDefaultAdmin)) {
        toast.error("Unauthorized access");
        navigate("/");
        return;
      }
      fetchData();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch blogs
      const blogsQuery = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const blogsSnapshot = await getDocs(blogsQuery);
      setBlogs(blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch users
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const usersSnapshot = await getDocs(usersQuery);
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch categories
      const categoriesQuery = query(collection(db, "categories"), orderBy("createdAt", "desc"));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    openModal({
      title: "Delete Blog",
      message: "Are you sure you want to delete this blog? This action cannot be undone.",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "blogs", id));
          setBlogs(blogs.filter(b => b.id !== id));
          toast.success("Blog deleted");
        } catch (error) {
          console.error("Error deleting blog:", error);
          toast.error("Failed to delete blog");
        }
        closeModal();
      }
    });
  };

  const handleDeleteUser = async (id: string) => {
    openModal({
      title: "Delete User",
      message: "Are you sure you want to ban/delete this user? This will remove their account data.",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "users", id));
          setUsers(users.filter(u => u.id !== id));
          toast.success("User deleted");
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
        closeModal();
      }
    });
  };

  const handlePromoteToAdmin = async (id: string) => {
    openModal({
      title: "Promote to Admin",
      message: "Are you sure you want to promote this user to Admin? They will have full access to the dashboard.",
      confirmText: "Promote",
      confirmVariant: "primary",
      onConfirm: async () => {
        try {
          const { updateDoc } = await import("firebase/firestore");
          await updateDoc(doc(db, "users", id), { role: "admin" });
          setUsers(users.map(u => u.id === id ? { ...u, role: "admin" } : u));
          toast.success("User promoted to Admin");
        } catch (error) {
          console.error("Error promoting user:", error);
          toast.error("Failed to promote user");
        }
        closeModal();
      }
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const { addDoc } = await import("firebase/firestore");
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategory.trim(),
        createdAt: Date.now()
      });
      setCategories([{ id: docRef.id, name: newCategory.trim(), createdAt: Date.now() }, ...categories]);
      setNewCategory("");
      toast.success("Category added");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    openModal({
      title: "Delete Category",
      message: "Are you sure you want to delete this category? Blogs using this category will not be affected but the category will be removed from the list.",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "categories", id));
          setCategories(categories.filter(c => c.id !== id));
          toast.success("Category deleted");
        } catch (error) {
          console.error("Error deleting category:", error);
          toast.error("Failed to delete category");
        }
        closeModal();
      }
    });
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) return;
    try {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "categories", id), {
        name: editCategoryName.trim()
      });
      setCategories(categories.map(c => c.id === id ? { ...c, name: editCategoryName.trim() } : c));
      setEditingCategory(null);
      setEditCategoryName("");
      toast.success("Category updated");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const startEditing = (category: any) => {
    setEditingCategory(category.id);
    setEditCategoryName(category.name);
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);
  const mostViewedBlog = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Users className="h-4 w-4" /> Total Users
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <FileText className="h-4 w-4" /> Total Blogs
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{blogs.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Activity className="h-4 w-4" /> Total Views
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Eye className="h-4 w-4" /> Top Blog Views
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{mostViewedBlog?.views || 0}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("blogs")}
              className={`w-1/3 border-b-2 py-4 px-1 text-center text-sm font-medium ${
                activeTab === "blogs"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Manage Blogs
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-1/3 border-b-2 py-4 px-1 text-center text-sm font-medium ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`w-1/3 border-b-2 py-4 px-1 text-center text-sm font-medium ${
                activeTab === "categories"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Manage Categories
            </button>
          </nav>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {activeTab === "blogs" ? (
            blogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No blogs found.</div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{blog.title || "Untitled"}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>By {blog.authorName || "Anonymous"}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        blog.status === "published" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {blog.status}
                      </span>
                      <span>{safeFormatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/blog/${blog.slug || blog.id}`} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="View">
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link to={`/edit/${blog.id}`} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Link>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : activeTab === "users" ? (
            users.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No users found.</div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={u.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-500"><Users className="h-5 w-5" /></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{u.name || "Anonymous"}</h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{u.email}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {u.role}
                        </span>
                        <span>Joined {safeFormatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${u.id}`} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="View Profile">
                      <Eye className="h-5 w-5" />
                    </Link>
                    {u.role !== "admin" && (
                      <>
                        <button onClick={() => handlePromoteToAdmin(u.id)} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Make Admin">
                          <Users className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Ban User">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="p-6">
              <form onSubmit={handleAddCategory} className="mb-8 flex gap-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New Category Name"
                  className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newCategory.trim()}
                  className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Add Category
                </button>
              </form>
              
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No categories found.</div>
                ) : (
                  categories.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      {editingCategory === c.id ? (
                        <div className="flex-1 flex gap-2 mr-4">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none dark:text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateCategory(c.id)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-gray-900 dark:text-white">{c.name}</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditing(c)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Edit Category"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleDeleteCategory(c.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete Category">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
      >
        {modalConfig.message}
      </ConfirmationModal>
    </div>
  );
}
