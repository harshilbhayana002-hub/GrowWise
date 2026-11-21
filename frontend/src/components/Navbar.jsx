import React, { useState } from "react";

export default function Navbar({
  user,
  profile,
  onOpenAuthModal,
  onOpenAddModal,
  onSignOut,
  onSelectTab,
  activeTab = "Product",
}) {
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const initial = (displayName[0] || "U").toUpperCase();

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 36px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
      background: "rgba(10, 15, 29, 0.75)",
      backdropFilter: "blur(16px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand */}
      <div
        onClick={() => onSelectTab && onSelectTab("Product")}
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 14,
          color: "#ffffff",
          boxShadow: "0 0 16px rgba(14, 165, 233, 0.4)",
          letterSpacing: "-0.5px"
        }}>
          GW
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.3px" }}>
            GrowWise
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "monospace",
            padding: "2px 8px",
            borderRadius: 12,
            background: "rgba(56, 189, 248, 0.15)",
            color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.3)",
          }}>
            Beta
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Product", "Features"].map((item) => (
          <button
            key={item}
            onClick={() => {
              if (onSelectTab) onSelectTab(item);
            }}
            style={{
              background: "none",
              border: "none",
              color: activeTab === item ? "#38bdf8" : "#94a3b8",
              fontSize: 14,
              fontWeight: activeTab === item ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.2s",
              padding: "4px 2px",
              borderBottom: activeTab === item ? "2px solid #38bdf8" : "2px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item) e.currentTarget.style.color = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item) e.currentTarget.style.color = "#94a3b8";
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {user ? (
          /* User Profile Logged In */
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: "4px 12px 4px 5px",
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
                color: "#ffffff",
              }}>
                {initial}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>
                {displayName}
              </span>
            </div>

            <button
              onClick={onSignOut}
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#fca5a5",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 8,
                padding: "6px 14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          /* Not Logged In */
          <>
            <button
              onClick={onOpenAuthModal}
              style={{
                background: "none",
                border: "none",
                color: "#cbd5e1",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                padding: "8px 14px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
            >
              Login
            </button>

            <button
              onClick={onOpenAuthModal}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f8fafc",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                padding: "8px 18px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              Get started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
