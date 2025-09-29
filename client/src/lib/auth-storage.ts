export type StoredUser = {
  id: number;
  username: string;
  email: string | null;
  is_staff: boolean;
};

export type StoredAuth = {
  user: StoredUser;
  tokens: {
    access: string;
    refresh: string;
  };
};

const STORAGE_KEY = "todoapp-auth";

export const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch (error) {
    console.error("Failed to parse auth storage", error);
    return null;
  }
};

export const setStoredAuth = (auth: StoredAuth | null) => {
  if (typeof window === "undefined") return;
  if (auth) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};
