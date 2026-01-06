import { useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, LayoutDashboard, Package, FolderOpen, FileText, ClipboardList, LogOut, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/items", label: "Items", icon: Package },
    { href: "/admin/templates", label: "Templates", icon: FileText },
    { href: "/admin/template-items", label: "Template Items", icon: Layers },
    { href: "/admin/inquiries", label: "Inquiries", icon: ClipboardList },
];

const AdminLayout = () => {
    const { user, isAdmin, isLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/auth");
        } else if (!isLoading && user && !isAdmin) {
            navigate("/");
        }
    }, [user, isAdmin, isLoading, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
                <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold">
                        Admin <span className="text-primary">Panel</span>
                    </span>
                </div>

                <nav className="flex flex-col gap-1 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 min-h-screen p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
