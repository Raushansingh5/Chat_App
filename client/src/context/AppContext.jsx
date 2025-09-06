import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const api = async (path, options = {}) => {
    try {
      return await axios({
        url: backendUrl + path,
        withCredentials: true,
        ...options,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setAuthUser(null);
      } else if (!err.response) {
        toast.error("Network error. Please check your connection.");
      }
      throw err;
    }
  };

  const checkAuth = async () => {
    setSessionLoading(true);
    try {
      const res = await api("/api/auth/check-auth");
      if (res.data.success) {
        setIsAuthenticated(true);
        setAuthUser(res.data.userData);
        connectSocket(res.data.userData);
      } else {
        setIsAuthenticated(false);
        setAuthUser(null);
        if (socket) {
          socket.disconnect();
          setSocket(null);
          setOnlineUsers([]);
        }
      }
    } catch (err) {
      setIsAuthenticated(false);
      setAuthUser(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setOnlineUsers([]);
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  const login = async (state, credentials) => {
    setLoading(true);
    try {
      const endpoint = state === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await api(endpoint, {
        method: "POST",
        data: credentials,
      });
      if (res.data.success) {
        setIsAuthenticated(true);
        setAuthUser(res.data.userData);
        connectSocket(res.data.userData);
        toast.success(res.data.message);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error during login/signup. Please try again."
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const res = await api("/api/auth/logout", {
        method: "POST",
      });
      if (res.data.success) {
        setIsAuthenticated(false);
        setAuthUser(null);
        if (socket) {
          socket.disconnect();
          setSocket(null);
          setOnlineUsers([]);
        }
        toast.success(res.data.message);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error during logout. Please try again."
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await api("/api/auth/update-profile", {
        method: "PUT",
        data: profileData,
      });
      if (res.data.success) {
        setAuthUser(res.data.userData);
        toast.success(res.data.message);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error updating profile. Please try again."
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    api,
    isAuthenticated,
    setIsAuthenticated,
    sessionLoading,
    loading,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
