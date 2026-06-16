/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Bell, Upload, Video, Menu, Sparkles, User, Sun, Moon } from "lucide-react";
import { Channel } from "../types";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (tab: 'inicio' | 'shorts' | 'videos' | 'live' | 'canais') => void;
  userChannel: Channel | null;
  onOpenUpload: () => void;
  onOpenCreateChannel: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onNavigate,
  userChannel,
  onOpenUpload,
  onOpenCreateChannel,
  onToggleSidebar,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("vidflow_theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      return "dark";
    } else {
      document.documentElement.removeAttribute("data-theme");
      return "light";
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("vidflow_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    onNavigate('inicio');
  };

  const clearSearch = () => {
    setLocalSearch("");
    setSearchQuery("");
  };

  return (
    <nav className="fixed top-0 left-0 right-5 h-16 bg-white border-b border-zinc-150 flex items-center justify-between px-4 z-40 shadow-xs" id="vidflow-navbar">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-950 transition-colors"
          title="Alternar Menu"
          id="navbar-toggle-menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div
          onClick={() => {
            clearSearch();
            onNavigate('inicio');
          }}
          className="flex items-center gap-2 cursor-pointer select-none group"
          id="navbar-logo"
        >
          <div className="w-9 h-9 bg-red-650 rounded-xl flex items-center justify-center shadow-md shadow-red-500/10 group-hover:bg-red-500 transition-colors animate-pulse">
            <Video className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-extrabold font-sans tracking-tight text-zinc-955 flex items-center gap-1.5 hover:text-zinc-900 transition-colors">
            Novinhas<span className="text-red-650"> Brasileiras</span>
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-zinc-100 text-zinc-500 font-mono rounded font-bold">
              Beta
            </span>
          </span>
        </div>
      </div>

      {/* Middle section: Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-lg mx-4"
        id="navbar-search-form"
      >
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="Pesquisar vídeos ou canais..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-zinc-50 text-zinc-900 pl-4 pr-12 py-2 rounded-full border border-zinc-200 focus:bg-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-sans text-sm transition-all"
            id="navbar-search-input"
          />
          <button
            type="submit"
            className="absolute right-1 p-2 bg-zinc-150 text-zinc-650 hover:text-zinc-950 rounded-full transition-colors flex items-center justify-center hover:bg-zinc-200"
            title="Pesquisar"
            id="navbar-search-btn"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Right section: User actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {userChannel ? (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-red-650 hover:bg-red-600 text-white rounded-full text-xs font-bold font-sans transition-all shadow-md active:scale-95"
            id="navbar-btn-upload"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar Vídeo</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateChannel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full text-xs font-bold font-sans transition-all active:scale-95 border border-zinc-200"
            id="navbar-btn-create-channel"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
            <span className="hidden sm:inline">Criar Canal</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-950 transition-colors"
          title={theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
          id="navbar-btn-theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button
          className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-950 transition-colors relative"
          title="Notificações"
          id="navbar-btn-notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User profile / Navigation to Canal directly */}
        {userChannel ? (
          <div
            onClick={() => {
              onNavigate('canais');
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-500 via-red-500 to-indigo-500 text-sm font-bold border border-zinc-200 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all select-none"
            title={`Seu Canal: ${userChannel.name}`}
            id="navbar-profile-avatar"
          >
            <span className="drop-shadow">{userChannel.avatar || "👤"}</span>
          </div>
        ) : (
          <div
            onClick={onOpenCreateChannel}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-650 border border-zinc-200 cursor-pointer hover:border-zinc-400 transition-all select-none"
            title="Acessar / Criar Canal"
            id="navbar-profile-placeholder"
          >
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </nav>
  );
};
