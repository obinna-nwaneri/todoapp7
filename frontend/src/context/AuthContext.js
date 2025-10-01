import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { logout as logoutRequest, fetchProfile } from '@/api/auth';
import { setAuthToken } from '@/api/client';
const STORAGE_KEY = 'enterprise_todo_auth';
export const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [state, setState] = useState(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return { user: null, token: null };
        try {
            const parsed = JSON.parse(raw);
            if (parsed.token) {
                setAuthToken(parsed.token);
            }
            return parsed;
        }
        catch {
            return { user: null, token: null };
        }
    });
    useEffect(() => {
        if (state.token) {
            setAuthToken(state.token);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
        else {
            setAuthToken();
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [state]);
    const setAuthState = useCallback((payload) => {
        setState(payload);
    }, []);
    const refreshProfile = useCallback(async () => {
        if (!state.token)
            return;
        try {
            const profile = await fetchProfile();
            setState((prev) => ({ ...prev, user: profile }));
        }
        catch (error) {
            console.error('Failed to refresh profile', error);
            setState({ user: null, token: null });
        }
    }, [state.token]);
    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        }
        catch (error) {
            console.warn('Logout request failed', error);
        }
        setState({ user: null, token: null });
    }, []);
    const value = useMemo(() => ({
        user: state.user,
        token: state.token,
        isAdmin: state.user?.role === 'admin',
        setAuthState,
        refreshProfile,
        logout,
    }), [logout, refreshProfile, setAuthState, state.token, state.user]);
    useEffect(() => {
        if (state.token && !state.user) {
            refreshProfile();
        }
    }, [refreshProfile, state.token, state.user]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
