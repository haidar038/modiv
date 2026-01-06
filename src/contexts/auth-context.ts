import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAdmin: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
