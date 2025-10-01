import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

export type UserRole = 'Admin' | 'Doctor' | 'Patient';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  doctorId?: number | null;
  patientId?: number | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    role: null,
    doctorId: null,
    patientId: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as UserRole | null;
    const doctorId = localStorage.getItem('doctorId');
    const patientId = localStorage.getItem('patientId');
    if (token && role) {
      setState({
        token,
        role,
        doctorId: doctorId ? Number(doctorId) : null,
        patientId: patientId ? Number(patientId) : null,
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, role, doctorId, patientId } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('role', role);
    if (doctorId) {
      localStorage.setItem('doctorId', String(doctorId));
    } else {
      localStorage.removeItem('doctorId');
    }
    if (patientId) {
      localStorage.setItem('patientId', String(patientId));
    } else {
      localStorage.removeItem('patientId');
    }
    setState({ token: accessToken, role, doctorId: doctorId ?? null, patientId: patientId ?? null });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('patientId');
    setState({ token: null, role: null, doctorId: null, patientId: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
