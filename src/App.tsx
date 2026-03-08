import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import Translate from "./pages/Translate";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import HospitalAuth from "./pages/HospitalAuth";
import HospitalDashboard from "./pages/HospitalDashboard";
import MyQRCode from "./pages/MyQRCode";
import Consent from "./pages/Consent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/hospital/auth" element={<HospitalAuth />} />
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/my-qr" element={<MyQRCode />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
