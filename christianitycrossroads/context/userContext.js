"use client";

import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";


// Create context
export const Context = createContext(null);

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

  const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Named export for provider
export const ContextProvider = ({ children }) => {
  const [user, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ track loading

    const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${backendUrl}/user/user-details`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.data) setUserDetails(data.data);
      console.log("User details fetched:", data.data);
    } catch (err) {
      console.error("Network error:", err.message);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <Context.Provider
      value={{ user, loading, setUserDetails, fetchUserDetails, toast, backendUrl, }}
    >
      {children}
    </Context.Provider>
  );
};
