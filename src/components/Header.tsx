import { Sparkles, LogIn, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Modiv <span className="text-primary">EventCraft</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/calculator"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Calculator
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
