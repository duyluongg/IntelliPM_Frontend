import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'; 

export type Role = 'PROJECT MANAGER' | 'ADMIN' | 'TEAM MEMBER' | 'CLIENT' | 'TEAM LEADER'; 

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role ;
  accessToken: string;
  refreshToken: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

const logout = () => {
  setUser(null);
  // localStorage.removeItem('user');
  // localStorage.removeItem('accessToken');
  // localStorage.removeItem('refreshToken');
  // localStorage.removeItem('persist:auth');
  localStorage.clear(); 
};


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
