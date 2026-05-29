import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('stan_theme') || 'dark');

  // Verify session on mount
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('stan_kanban_token');
      if (token) {
        try {
          const userData = await api.me();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid:", error);
          localStorage.removeItem('stan_kanban_token');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  // Theme application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stan_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api.login(username, password);
      localStorage.setItem('stan_kanban_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, display_name) => {
    setLoading(true);
    try {
      const data = await api.register(username, password, display_name);
      localStorage.setItem('stan_kanban_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      setConnectedUsers([]);
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsPort = window.location.port === '5173' ? ':3000' : (window.location.port ? `:${window.location.port}` : '');
    const wsUrl = `${wsProtocol}//${window.location.hostname}${wsPort}`;

    let socket = null;
    let reconnectTimeout = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        const token = localStorage.getItem('stan_kanban_token');
        if (token) {
          socket.send(JSON.stringify({ type: 'auth', token }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected_users') {
            setConnectedUsers(data.users);
          }
        } catch (e) {
          console.error("WS error parsing message:", e);
        }
      };

      socket.onclose = () => {
        if (!isDisposed && localStorage.getItem('stan_kanban_token')) {
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("WS connection error:", err);
        socket.close();
      };
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, [user]);

  const logout = () => {
    localStorage.removeItem('stan_kanban_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, theme, toggleTheme, connectedUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
