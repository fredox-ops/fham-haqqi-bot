import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import RouteFade from "@/components/RouteFade";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Chat from "./pages/Chat.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Categories from "./pages/Categories.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors closeButton />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <RouteFade>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </RouteFade>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
