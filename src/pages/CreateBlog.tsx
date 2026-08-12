import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import slugify from "slugify";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Loader2, Sparkles, Bold, Italic, Code, List, Heading, Eye, Edit3, X, Wand2 } from "lucide-react";
import { DEFAULT_CATEGORIES } from "../lib/utils";

export default function CreateBlog() {
  const { id } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesQuery = query(collection(db, "categories"), orderBy("createdAt", "desc"));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        if (!categoriesSnapshot.empty) {
          const dbCatNames = categoriesSnapshot.docs.map(doc => doc.data().name).filter(Boolean);
          const combined = Array.from(new Set([...dbCatNames, ...DEFAULT_CATEGORIES]));
          setCategories(combined);
          setCategory(combined[0]);
        } else {
          setCategories(DEFAULT_CATEGORIES);
          setCategory(DEFAULT_CATEGORIES[0]);
        }

        if (id && user) {
          const docRef = doc(db, "blogs", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.authorId !== user.uid && profile?.role !== "admin") {
              toast.error("You don't have permission to edit this story");
              navigate("/profile/" + user.uid);
              return;
            }
            setTitle(data.title || "");
            setContent(data.content || "");
            setCategory(data.category || DEFAULT_CATEGORIES[0]);
            setTags(data.tags?.join(", ") || "");
          } else {
            toast.error("Story not found");
            navigate("/profile/" + user.uid);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [id, user, authLoading, navigate, profile]);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    setContent((prev) => prev + `${prefix}text${suffix}`);
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for the AI");
      return;
    }

    setAiLoading(true);
    try {
      // Import Gemini SDK dynamically
      const { GoogleGenAI } = await import("@google/genai");
      const apiKey = process.env.GEMINI_API_KEY || "";

      if (apiKey && apiKey.length > 5) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are an expert tech and story writer. Write a captivating Markdown blog post based on this prompt: "${aiPrompt}". 
Return your output formatted exactly as follows:
TITLE: [Your Title Here]
TAGS: [tag1, tag2, tag3]
CATEGORY: [Web Dev, Technology, AI & ML, Design, Tutorials, or Life & Productivity]
CONTENT:
[Complete, engaging Markdown blog post content with headings, code snippets if technical, and formatting]`,
        });

        const text = response.text || "";
        const titleMatch = text.match(/TITLE:\s*(.*)/i);
        const tagsMatch = text.match(/TAGS:\s*(.*)/i);
        const categoryMatch = text.match(/CATEGORY:\s*(.*)/i);
        const contentMatch = text.split(/CONTENT:\s*/i)[1];

        if (titleMatch && titleMatch[1]) setTitle(titleMatch[1].trim());
        if (tagsMatch && tagsMatch[1]) setTags(tagsMatch[1].trim());
        if (categoryMatch && categoryMatch[1]) {
          const matchedCat = categories.find(c => c.toLowerCase() === categoryMatch[1].trim().toLowerCase());
          if (matchedCat) setCategory(matchedCat);
        }
        if (contentMatch) {
          setContent(contentMatch.trim());
        } else {
          setContent(text);
        }
        toast.success("AI Story generated successfully!");
      } else {
        // Fallback intelligent template generator if API key is not present
        const sampleTitle = aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1);
        setTitle(`Exploring ${sampleTitle}: A Comprehensive Guide`);
        setContent(`## Introduction to ${sampleTitle}

Welcome to this in-depth guide on **${sampleTitle}**. Whether you're a developer, creator, or enthusiast, understanding this topic can open new opportunities and elevate your skills.

### Key Highlights
- **Fast Performance**: Optimized execution and clean patterns.
- **Modern Architecture**: Designed for flexibility and scalability.
- **Community Support**: Extensive documentation and ecosystem.

\`\`\`javascript
// Sample implementation overview
function ${slugify(sampleTitle, { lower: true, strict: true }).replace(/-/g, '_')}() {
  console.log("Initializing ${sampleTitle}...");
  return { status: "success", ready: true };
}
\`\`\`

### Conclusion
Mastering ${sampleTitle} is an empowering journey. Share your thoughts and questions in the responses below!`);
        setTags("webdev, technology, tutorial, guide");
        toast.success("Generated story outline!");
      }
      setIsAiModalOpen(false);
      setAiPrompt("");
    } catch (err: any) {
      console.error("AI Generation error:", err);
      toast.error("Failed to generate content with AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Story title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Story content is required");
      return;
    }

    setSaving(true);
    try {
      const blogId = id || doc(collection(db, "blogs")).id;
      const slug = slugify(title, { lower: true, strict: true }) + "-" + Math.random().toString(36).substring(2, 8);
      
      const blogData: any = {
        id: blogId,
        title: title.trim(),
        content: content.trim(),
        authorId: user!.uid,
        authorName: profile?.name || user!.displayName || "Anonymous",
        authorImage: profile?.profileImage || user!.photoURL || "",
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        category: category || categories[0] || "General",
        status,
        updatedAt: Date.now(),
      };

      if (!id) {
        blogData.slug = slug;
        blogData.createdAt = Date.now();
        blogData.views = 0;
        blogData.likes = 0;
        blogData.commentsCount = 0;
      }

      await setDoc(doc(db, "blogs", blogId), blogData, { merge: true });
      
      toast.success(`Story ${status === "published" ? "published" : "saved as draft"} successfully!`);
      navigate(`/profile/${user!.uid}?tab=dashboard`);
    } catch (error: any) {
      console.error("Error saving blog:", error);
      toast.error(error.message || "Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Bar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span>{id ? "Edit Story" : "Write a New Story"}</span>
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Writing Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>{isPreview ? "Edit View" : "Preview Markdown"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="rounded-full bg-white dark:bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Publish Story
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Story Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white px-0 tracking-tight"
          />

          {/* Quick Toolbar */}
          {!isPreview && (
            <div className="flex items-center gap-1 p-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
              <button type="button" onClick={() => insertMarkdown("**", "**")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Bold"><Bold className="h-4 w-4" /></button>
              <button type="button" onClick={() => insertMarkdown("*", "*")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Italic"><Italic className="h-4 w-4" /></button>
              <button type="button" onClick={() => insertMarkdown("### ")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Heading"><Heading className="h-4 w-4" /></button>
              <button type="button" onClick={() => insertMarkdown("```javascript\n", "\n```")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Code Block"><Code className="h-4 w-4" /></button>
              <button type="button" onClick={() => insertMarkdown("- ")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="List"><List className="h-4 w-4" /></button>
            </div>
          )}

          {isPreview ? (
            <div className="prose prose-lg dark:prose-invert max-w-none min-h-[500px] p-6 border border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content || "*Nothing to preview yet... Write something amazing!*"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              placeholder="Tell your story... (Supports Markdown, syntax highlighting, and images)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono text-sm leading-relaxed"
            />
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Story Metadata</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Category Topic</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map((catName) => (
                  <option key={catName} value={catName}>{catName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, tutorial, javascript"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Tags help readers discover your story in search.</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                <Wand2 className="h-6 w-6" />
                <span className="text-lg">AI Story Generator</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAiGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">What story or article would you like to create?</label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Write a guide on React 19 hooks and server components with code examples..."
                  className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white disabled:opacity-50 shadow-md shadow-indigo-600/30"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {aiLoading ? "Generating..." : "Generate Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

