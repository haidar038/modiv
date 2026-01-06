import { useState } from "react";
import { LogIn, LogOut, Settings, Menu, Home, Calculator } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Header = () => {
    const { user, isAdmin, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { href: "/", label: "Beranda", icon: Home },
        { href: "/calculator", label: "Kalkulator", icon: Calculator },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <img src="/logo/mdv-primary-light.svg" alt="Modiv EventCraft" className="h-9 w-auto" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                    {navLinks.map((link) => (
                        <Link key={link.href} to={link.href} className={cn("text-sm font-medium transition-colors hover:text-foreground", isActive(link.href) ? "text-foreground" : "text-muted-foreground")}>
                            {link.label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link to="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            <Settings className="h-4 w-4" />
                        </Link>
                    )}
                    {user ? (
                        <Button variant="ghost" size="sm" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar
                        </Button>
                    ) : (
                        <Link to="/auth">
                            <Button variant="ghost" size="sm">
                                <LogIn className="mr-2 h-4 w-4" />
                                Masuk
                            </Button>
                        </Link>
                    )}
                </nav>

                {/* Mobile Navigation */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px]">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                <img src="/logo/mdv-primary-light.svg" alt="Modiv EventCraft" className="h-8 w-auto" />
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="mt-8 flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive(link.href) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        location.pathname.startsWith("/admin") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <Settings className="h-4 w-4" />
                                    Admin Panel
                                </Link>
                            )}
                            <div className="my-4 h-px bg-border" />
                            {user ? (
                                <Button variant="outline" className="justify-start" onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Keluar
                                </Button>
                            ) : (
                                <Link to="/auth" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Masuk
                                    </Button>
                                </Link>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};

export default Header;
