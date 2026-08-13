import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormatDate(dateVal: any, formatStr: string = "MMM d, yyyy"): string {
  if (!dateVal) return "Recent";
  try {
    let date: Date;
    if (typeof dateVal === "number") {
      date = new Date(dateVal);
    } else if (typeof dateVal === "string") {
      const parsedNum = Number(dateVal);
      if (!isNaN(parsedNum) && parsedNum > 100000000000) {
        date = new Date(parsedNum);
      } else {
        date = new Date(dateVal);
      }
    } else if (dateVal instanceof Date) {
      date = dateVal;
    } else if (typeof dateVal === "object" && dateVal?.seconds) {
      date = new Date(dateVal.seconds * 1000);
    } else {
      return "Recent";
    }

    if (!isValid(date)) return "Recent";
    return format(date, formatStr);
  } catch (error) {
    return "Recent";
  }
}

export function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const wordsPerMinute = 200;
  const cleanText = text.replace(/<[^>]*>/g, "").replace(/[#*`_]/g, "");
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Bookmarking local persistence helpers
const BOOKMARKS_KEY = "devblog_bookmarks";

export function getBookmarks(): string[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(blogId: string): boolean {
  try {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(blogId);
    let newBookmarks: string[];
    let isAdded = false;
    if (index >= 0) {
      newBookmarks = bookmarks.filter((id) => id !== blogId);
      isAdded = false;
    } else {
      newBookmarks = [...bookmarks, blogId];
      isAdded = true;
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    return isAdded;
  } catch {
    return false;
  }
}

export function isBookmarked(blogId: string): boolean {
  return getBookmarks().includes(blogId);
}

export const DEFAULT_CATEGORIES = [
  "Technology",
  "Web Dev",
  "AI & ML",
  "Design",
  "Tutorials",
  "Life & Productivity",
];

