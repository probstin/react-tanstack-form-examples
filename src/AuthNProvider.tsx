import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Loading } from "./Loading";

type User = {
    id: string;
    name: string;
    email?: string;
    roles?: string[];
};

type AuthNContextValue = {
    isAuthenticated: boolean;
    user: User | null;
};

const AuthNContext = createContext<AuthNContextValue | undefined>(undefined);

type AuthNProviderProps = {
    children: React.ReactNode;
    /**
     * How long to "load" before returning a mock user
     */
    simulateDelayMs?: number;
    /**
     * Provide your own mock user if desired
     */
    mockUser?: User;
};

export function AuthNProvider({
    children,
    mockUser = {
        id: "u_123",
        name: "Taylor Dev",
        email: "taylor@example.com",
        roles: ["user"],
    },
}: AuthNProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Simulate an async auth bootstrap (e.g., cookie/session check)
    useEffect(() => {
        setTimeout(() => {
            setUser(mockUser);
            setLoading(false);
        }, 1200);
    }, [mockUser]);

    const value = useMemo<AuthNContextValue>(
        () => ({ isAuthenticated: !!user, user }),
        [user]
    );

    // While "auth" is bootstrapping, show a full-page loading screen
    // and wrap children so nested providers/components can contribute loading text.
    if (loading) {
        return <Loading loading={true} />;
    }

    return <AuthNContext.Provider value={value}>{children}</AuthNContext.Provider>;
}

/**
 * useAuthN hook — exposes { isAuthenticated, user }
 * Example: const { isAuthenticated, user } = useAuthN();
 */
export function useAuthN() {
    const ctx = useContext(AuthNContext);
    if (!ctx) {
        throw new Error("useAuthN must be used within an <AuthNProvider>");
    }
    return ctx;
}
