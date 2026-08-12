import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { Layout } from "./components/Layout";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateBlog from "./pages/CreateBlog";
import BlogDetail from "./pages/BlogDetail";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Search from "./pages/Search";
import { SubPage } from "./pages/SubPage";

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="devblog-theme">
        <AuthProvider>
          <BrowserRouter>
            <NavigationProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="create" element={<CreateBlog />} />
                  <Route path="edit/:id" element={<CreateBlog />} />
                  <Route path="blog/:slug" element={<BlogDetail />} />
                  <Route path="profile/:id" element={<Profile />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="search" element={<Search />} />
                  <Route path="about" element={<SubPage />} />
                  <Route path="help" element={<SubPage />} />
                  <Route path="privacy" element={<SubPage />} />
                  <Route path="terms" element={<SubPage />} />
                  <Route path="guidelines" element={<SubPage />} />
                  <Route path="newsletter" element={<SubPage />} />
                  <Route path="events" element={<SubPage />} />
                  <Route path="careers" element={<SubPage />} />
                  <Route path="*" element={<Home />} />
                </Route>
              </Routes>
            </NavigationProvider>
          </BrowserRouter>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

