import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Library, Search, Settings } from "lucide-react";
import { cn } from "../../lib/utils";

export const Sidebar: React.FC = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Library, label: "Library", path: "/library" },
    { icon: Search, label: "History", path: "/transfer-history" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 bg-white border-r-4 border-black h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8 px-4">
        <h1 className="text-2xl font-bold">Velvet Metal</h1>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 mb-2 font-medium rounded-lg transition-all",
                "hover:bg-yellow-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                "border-2 border-transparent hover:border-black",
                isActive &&
                  "bg-yellow-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4">
        <div className="border-4 border-black p-4 rounded-lg bg-purple-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-bold mb-2">Pro Tip</h3>
          <p className="text-sm">
            Press Ctrl + K to quickly search your library
          </p>
        </div>
      </div>
    </div>
  );
};
