"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/curriculum", label: "Curriculum", icon: "📚" },
  { href: "/practice", label: "Practice", icon: "⚡" },
  { href: "/playground", label: "Playground", icon: "🎮" },
  { href: "/progress", label: "Progress", icon: "📊" },
  { href: "/glossary", label: "Glossary", icon: "📖" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10, 14, 26, 0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        height: "64px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--gradient-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "800",
              boxShadow: "var(--shadow-glow-blue)",
            }}
          >
            🐍
          </div>
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: "800",
              fontSize: "1.25rem",
              background: "var(--gradient-hero)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PyMastery
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          className="hide-mobile"
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
          {!loading && (
            user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={user.photoURL || ""}
                  alt="Profile"
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--accent-blue)" }}
                />
                <button
                  onClick={handleSignOut}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.9rem" }}
              >
                Sign in with Google
              </button>
            )
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            padding: "6px 10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
            padding: "12px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`nav-link ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
