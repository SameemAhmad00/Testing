import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { User as UserIcon, Save, Monitor, Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const { user, profile, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setProfileImage(profile.profileImage || "");
    }
  }, [user, profile, loading, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Get user's blogs and comments to update their denormalized data
      const blogsQuery = query(collection(db, "blogs"), where("authorId", "==", user.uid));
      const blogsSnapshot = await getDocs(blogsQuery);
      
      const commentsQuery = query(collection(db, "comments"), where("userId", "==", user.uid));
      const commentsSnapshot = await getDocs(commentsQuery);

      // Use a batch to update everything atomically
      const batch = writeBatch(db);
      
      batch.update(userRef, {
        name: name.trim(),
        bio: bio.trim(),
        profileImage: profileImage.trim(),
      });

      blogsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          authorName: name.trim(),
          authorImage: profileImage.trim(),
        });
      });

      commentsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          userName: name.trim(),
          userImage: profileImage.trim(),
        });
      });

      await batch.commit();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          {/* Profile Image Preview */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-950 shadow-md overflow-hidden flex-shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="Profile Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <UserIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profile Image URL
              </label>
              <input
                type="url"
                id="profileImage"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white transition-colors"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Provide a direct link to an image to use as your avatar.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself..."
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Your email address cannot be changed.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  theme === "light"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <Sun className={`h-6 w-6 ${theme === "light" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`text-sm font-medium ${theme === "light" ? "text-indigo-900 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  theme === "dark"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <Moon className={`h-6 w-6 ${theme === "dark" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`text-sm font-medium ${theme === "dark" ? "text-indigo-900 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  theme === "system"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <Monitor className={`h-6 w-6 ${theme === "system" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`text-sm font-medium ${theme === "system" ? "text-indigo-900 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}>System</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
