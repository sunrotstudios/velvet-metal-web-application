import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "sonner";

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#f0f0f0]">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};
