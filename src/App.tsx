import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CalculatorProvider } from "@/contexts/CalculatorContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import Auth from "./pages/Auth";
import Success from "./pages/Success";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Items from "./pages/admin/Items";
import Templates from "./pages/admin/Templates";
import Inquiries from "./pages/admin/Inquiries";
import TemplateItems from "./pages/admin/TemplateItems";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CalculatorProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/calculator" element={<Calculator />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/success" element={<Success />} />
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="categories" element={<Categories />} />
                                    <Route path="items" element={<Items />} />
                                    <Route path="templates" element={<Templates />} />
                                    <Route path="template-items" element={<TemplateItems />} />
                                    <Route path="inquiries" element={<Inquiries />} />
                                </Route>
                                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </BrowserRouter>
                    </TooltipProvider>
                </CalculatorProvider>
            </AuthProvider>
        </QueryClientProvider>
    </ErrorBoundary>
);

export default App;
