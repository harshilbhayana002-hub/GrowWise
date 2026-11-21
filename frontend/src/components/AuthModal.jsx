import React, { useState } from "react";

export default function AuthModal({ isOpen, onClose, onSignIn, onSignUp, isConfigured }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setNeedsEmailConfirm(false);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password) {
          setErrorMsg("Please provide both email and password.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const { data, error } = await onSignUp({ email, password, fullName });
        if (error) {
          if (error.message.toLowerCase().includes("rate limit")) {
            setErrorMsg(
              "Supabase free email rate limit reached. To fix this instantly: Go to Supabase Dashboard -> Authentication -> Providers -> Email -> Turn OFF 'Confirm email'."
            );
          } else {
            setErrorMsg(error.message);
          }
        } else {
          // Check if session was returned or if email confirmation is required
          if (data?.user && !data?.session) {
            setNeedsEmailConfirm(true);
            setSuccessMsg("Account registered!");
          } else {
            setSuccessMsg("Account created and logged in!");
            setTimeout(() => {
              onClose();
            }, 700);
          }
        }
      } else {
        const { data, error } = await onSignIn({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setErrorMsg(
              "Email not confirmed yet! Please check your email inbox for the Supabase confirmation link, or disable 'Confirm email' in Supabase to log in instantly."
            );
          } else {
            setErrorMsg(error.message);
          }
        } else {
          setSuccessMsg("Logged in successfully!");
          setTimeout(() => {
            onClose();
          }, 600);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(3, 7, 18, 0.8)",
      backdropFilter: "blur(16px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 16,
    }}>
      <div style={{
        background: "#0c1322",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 24,
        padding: "32px",
        width: "100%",
        maxWidth: 460,
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(14, 165, 233, 0.15)",
        position: "relative",
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              color: "#ffffff",
            }}>
              AI
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>
              {isSignUp ? "Create Your Account" : "Sign In to Dashboard"}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            {isSignUp
              ? "Join and get your personalized AI habit operator and 90-day learning dataset."
              : "Access your personalized learning habits and real-time AI analytics."}
          </p>

          {/* Mode Pill Badge */}
          <div style={{ marginTop: 10 }}>
            {isConfigured ? (
              <span style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: "#4ade80",
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                padding: "3px 8px",
                borderRadius: 12,
              }}>
                ● Supabase Cloud Connected
              </span>
            ) : (
              <span style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                padding: "3px 8px",
                borderRadius: 12,
              }}>
                ⚡ Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 12,
            color: "#fca5a5",
            marginBottom: 16,
            lineHeight: 1.5,
          }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {needsEmailConfirm && (
          <div style={{
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 12,
            color: "#fde68a",
            marginBottom: 16,
            lineHeight: 1.5,
          }}>
            <strong>Email confirmation required:</strong><br />
            Supabase sent a confirmation link to your inbox. Click the link to activate your account.
            <div style={{ marginTop: 8, fontSize: 11, color: "#cbd5e1" }}>
              💡 <em>To log in instantly without email verification:</em> Go to <strong>Supabase Dashboard &gt; Authentication &gt; Providers &gt; Email</strong> and toggle <strong>Confirm email</strong> OFF.
            </div>
          </div>
        )}

        {successMsg && !needsEmailConfirm && (
          <div style={{
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.4)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            color: "#86efac",
            marginBottom: 16,
            fontFamily: "monospace",
          }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isSignUp && (
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Harshil"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "#151e33",
                  color: "#f8fafc",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "#151e33",
                color: "#f8fafc",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "#151e33",
                color: "#f8fafc",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              border: "none",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 4px 16px rgba(14, 165, 233, 0.4)",
              marginTop: 4,
            }}
          >
            {loading ? "Processing..." : isSignUp ? "Create Account & Seed Data" : "Sign In"}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
              setSuccessMsg("");
              setNeedsEmailConfirm(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#38bdf8",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
