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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors closeButton />
      <BrowserRouter>
        <RouteFade>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteFade>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
