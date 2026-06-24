import React from 'react';
import { Search, Moon, Sun, Bell, Menu } from 'lucide-react';

export default function Header({
  theme,
  setTheme,
  globalSearch,
  setGlobalSearch,
  sidebarOpen,
  setSidebarOpen
}) {
  return (
    <header className="main-header">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="icon-btn mobile-only sidebar-toggle"
        title="Toggle Menu"
      >
        <Menu />
      </button>

      <div className="header-search">
        <Search />
        <input
          type="text"
          placeholder="Search store console..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="icon-btn"
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon style={{ width: 18, height: 18 }} />
          ) : (
            <Sun style={{ width: 18, height: 18 }} />
          )}
        </button>

        <button className="icon-btn" title="Notifications">
          <Bell style={{ width: 18, height: 18 }} />
          <span className="badge-dot"></span>
        </button>
      </div>
    </header>
  );
}
