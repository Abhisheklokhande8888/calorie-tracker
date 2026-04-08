import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-brand-500 text-white"
      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800"
  }`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm">
            CP
          </span>
          <span className="hidden sm:inline">Calories & Protein</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/add-food" className={linkClass} onClick={closeMenu}>
              Add food
            </NavLink>
            <NavLink to="/my-foods" className={linkClass} onClick={closeMenu}>
              My foods
            </NavLink>
            <NavLink to="/calculator" className={linkClass} onClick={closeMenu}>
              Calculator
            </NavLink>
            <NavLink to="/history" className={linkClass} onClick={closeMenu}>
              History
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <span className="text-lg" aria-hidden>
                ☀️
              </span>
            ) : (
              <span className="text-lg" aria-hidden>
                🌙
              </span>
            )}
          </button>
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="hidden md:inline text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
      {isAuthenticated && menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900">
          <nav className="flex flex-col gap-2">
            <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/add-food" className={linkClass} onClick={closeMenu}>
              Add food
            </NavLink>
            <NavLink to="/my-foods" className={linkClass} onClick={closeMenu}>
              My foods
            </NavLink>
            <NavLink to="/calculator" className={linkClass} onClick={closeMenu}>
              Calculator
            </NavLink>
            <NavLink to="/history" className={linkClass} onClick={closeMenu}>
              History
            </NavLink>
            <button
              type="button"
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="px-3 py-2 rounded-lg text-left text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </nav>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">{user?.name}</p>
        </div>
      )}
    </header>
  );
}
